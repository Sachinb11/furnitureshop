'use client';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { formatCurrency } from '@/lib/utils/format';

export function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCartStore();
  const shipping = subtotal >= 10000 ? 0 : 199;
  const gst = +(subtotal * 0.18).toFixed(2);
  const total = +(subtotal + shipping + gst).toFixed(2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-medium mb-6">My cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link href="/products" className="btn-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 card p-4">
                <div className="w-20 h-20 rounded-lg bg-[#F0EDE8] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🛋️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium truncate">{item.name}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {item.variant && (
                    <p className="text-xs text-gray-400 mb-1">{item.variant}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-2">
                    {formatCurrency(item.price)} each
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit card p-5 space-y-3">
            <h2 className="font-medium">Order summary</h2>
            <div className="space-y-2 text-sm">
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
            {shipping > 0 && (
              <p className="text-xs text-gray-400">
                Add {formatCurrency(10000 - subtotal)} more for free shipping
              </p>
            )}
            <Link href="/checkout" className="block btn-primary text-center py-3 text-sm">
              Proceed to checkout
            </Link>
            <Link
              href="/products"
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
