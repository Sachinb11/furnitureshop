'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { ordersApi } from '@/lib/api/orders';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { getApiErrorMessage } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Search, FileText } from 'lucide-react';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-sky-100 text-sky-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-600',
};

export function AdminOrdersPage() {
  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status, search],
    queryFn:  () => adminApi.getOrders({
      page, limit: 20,
      status: status || undefined,
      search: search || undefined,
    }),
    staleTime: 30_000,
  });

  const payload  = data?.data ?? data;
  const orders: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta ?? { totalPages: 1, total: 0 };

  const updateStatus = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      ordersApi.updateStatus(id, newStatus),
    onSuccess: () => {
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (e: any) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search order number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9 text-sm w-56"
          />
        </div>
        <select
          className="form-input w-auto text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Order no.</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center">
                  <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-400 text-sm">No orders found</p>
                </td></tr>
              ) : (
                orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-500">{o.items?.length ?? 0}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(Number(o.total))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        o.payment?.status === 'captured' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {o.payment?.status ?? 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus.mutate({ id: o.id, newStatus: e.target.value })}
                        disabled={updateStatus.isPending}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[o.status] ?? 'bg-gray-100'}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(o.placedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{meta.total} orders total</span>
            <div className="flex gap-1">
              {[...Array(Math.min(meta.totalPages, 8))].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded text-xs border transition ${
                    page === i + 1 ? 'bg-[#0058A3] text-white border-[#0058A3]' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
