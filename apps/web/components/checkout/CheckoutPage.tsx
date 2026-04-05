'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { ordersApi } from '@/lib/api/orders';
import { paymentsApi } from '@/lib/api/payments';
import { formatCurrency } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

export function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    phone:     user?.phone     ?? '',
    line1:     '',
    line2:     '',
    city:      '',
    state:     '',
    pincode:   '',
    country:   'India',
  });

  const shipping = subtotal >= 10000 ? 0 : 199;
  const gst      = +(subtotal * 0.18).toFixed(2);
  const total    = +(subtotal + shipping + gst).toFixed(2);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setLoading(true);

    try {
      // Create order
      const orderRes = await ordersApi.create({
        address: form,
        addressId: '00000000-0000-0000-0000-000000000000',
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity:  i.quantity,
        })),
      });

      const orderId =
        orderRes?.data?.data?.id ?? orderRes?.data?.id ?? orderRes?.id;

      if (!orderId) throw new Error('Order creation failed — no ID returned');

      // Initiate payment
      const payRes  = await paymentsApi.initiate(orderId);
      const payData = payRes?.data?.data ?? payRes?.data ?? payRes;

      const rzpKey = payData?.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (rzpKey && !rzpKey.includes('placeholder') && typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key:      rzpKey,
          amount:   payData.amount,
          currency: payData.currency ?? 'INR',
          order_id: payData.razorpayOrderId,
          name:     'Furnishop',
          handler:  async (response: any) => {
            await paymentsApi.verify({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clear();
            router.push(`/checkout/success?order=${orderId}`);
          },
          modal:  { ondismiss: () => setLoading(false) },
          theme:  { color: '#0058A3' },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (err: any) => {
          toast.error(err?.error?.description ?? 'Payment failed');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Dev mode — skip real payment
        clear();
        router.push(`/checkout/success?order=${orderId}`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Checkout failed. Please try again.';
      toast.error(msg);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/products" className="btn-primary">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-medium mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left — address form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h2 className="font-medium mb-4">Delivery address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">First name *</label>
                  <input name="firstName" required className="form-input"
                    value={form.firstName} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">Last name *</label>
                  <input name="lastName" required className="form-input"
                    value={form.lastName} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Phone *</label>
                  <input name="phone" required className="form-input"
                    placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Address line 1 *</label>
                  <input name="line1" required className="form-input"
                    placeholder="Flat, House no., Building, Street"
                    value={form.line1} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Address line 2</label>
                  <input name="line2" className="form-input"
                    placeholder="Area, Colony (optional)"
                    value={form.line2} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">City *</label>
                  <input name="city" required className="form-input"
                    value={form.city} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">Pincode *</label>
                  <input name="pincode" required className="form-input"
                    maxLength={6} value={form.pincode} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">State *</label>
                  <select name="state" required className="form-input"
                    value={form.state} onChange={handleChange}>
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                Payments are 256-bit SSL encrypted via Razorpay. We accept UPI, credit/debit cards,
                net banking, and wallets.
              </span>
            </div>
          </div>

          {/* Right — order summary */}
          <div className="h-fit card p-5 space-y-3">
            <h2 className="font-medium">Order summary</h2>
            <ul className="space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between text-gray-600 gap-2">
                  <span className="truncate">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="flex-shrink-0 font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-gray-100 pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0058A3] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#004f93] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
            </button>
          </div>
        </div>
      </form>

      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
