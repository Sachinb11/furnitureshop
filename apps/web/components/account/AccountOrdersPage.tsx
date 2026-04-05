'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/lib/store/authStore';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-sky-100 text-sky-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-600',
};

export function AccountOrdersPage() {
  const { user } = useAuthStore();
  const router   = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn:  () => ordersApi.getAll(),
    enabled:  Boolean(user),
    staleTime: 30_000,
  });

  const raw    = data?.data?.data ?? data?.data ?? data;
  const orders: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-medium mb-6">My orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">No orders yet</p>
          <a href="/products" className="text-sm text-[#0058A3] hover:underline">
            Start shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-sm font-mono">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(order.placedAt)}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {order.items?.length ?? 0} item(s)
              </p>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="font-medium">{formatCurrency(Number(order.total))}</span>
                {order.status === 'delivered' && (
                  <span className="text-xs text-green-600 font-medium">✓ Delivered</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
