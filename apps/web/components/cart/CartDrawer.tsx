'use client';
import { X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';
import { formatCurrency } from '@/lib/utils/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const { items, subtotal, updateQty, removeItem } = useCartStore();
  const shipping = subtotal >= 10000 ? 0 : 199;
  const gst = +(subtotal * 0.18).toFixed(2);
  const total = +(subtotal + shipping + gst).toFixed(2);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-medium">
            My cart{' '}
            {items.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 transition"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag size={40} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-3">Your cart is empty</p>
              <Link
                href="/products"
                onClick={onClose}
                className="text-sm text-[#0058A3] hover:underline"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-[#F0EDE8] flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🛋️</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight line-clamp-2">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition"
                        aria-label="Remove item"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {item.variant && (
                      <p className="text-xs text-gray-400">{item.variant}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-sm hover:bg-gray-50"
                        >
                          −
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-sm hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST (18%)</span>
                <span>{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-[#0058A3] text-white text-center py-3.5 rounded-xl text-sm font-medium hover:bg-[#004f93] transition"
            >
              Proceed to checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2 py-1"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
