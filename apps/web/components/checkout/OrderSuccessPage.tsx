'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export function OrderSuccessPage({ orderId }: { orderId?: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto mb-4 text-green-500" size={56} />
      <h1 className="text-2xl font-medium mb-2">Order placed successfully!</h1>
      {orderId && (
        <p className="text-gray-500 mb-2 text-sm font-mono">Order ID: {orderId}</p>
      )}
      <p className="text-gray-500 mb-8 leading-relaxed">
        A confirmation email will be sent shortly. Your order will be delivered in 5–7
        business days.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/account/orders" className="btn-secondary">
          View my orders
        </Link>
        <Link href="/products" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
