'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import {
  ShoppingBag, Users, Package, TrendingUp,
  AlertTriangle, ArrowRight, RefreshCw,
} from 'lucide-react';

function StatCard({
  label, value, icon: Icon, color, href,
}: {
  label: string; value: string; icon: any; color: string; href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">{label}</p>
          <p className="text-2xl font-medium">{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}

const STATUS_BADGE: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-sky-100 text-sky-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-600',
};

export function AdminDashboardPage() {
  const { data, isLoading, refetch, error } = useQuery({
    queryKey:  ['admin-dashboard'],
    queryFn:   () => adminApi.getDashboard(),
    staleTime: 60_000,
    retry:     2,
  });

  // Unwrap envelope: { success, data: { totalOrders, ... } }
  const d = data?.data ?? data ?? {};

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-3" />
        <p className="text-gray-600 mb-1">Failed to load dashboard</p>
        <p className="text-xs text-gray-400 mb-4">
          Make sure the backend is running at{' '}
          <code className="font-mono bg-gray-100 px-1 rounded">localhost:3001</code>
        </p>
        <button onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-[#0058A3] border border-[#0058A3] px-4 py-2 rounded-lg hover:bg-blue-50">
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total revenue',
      value: formatCurrency(d.totalRevenue ?? 0),
      icon:  TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Total orders',
      value: (d.totalOrders ?? 0).toLocaleString('en-IN'),
      icon:  ShoppingBag,
      color: 'bg-blue-500',
      href:  '/admin/orders',
    },
    {
      label: 'Products',
      value: (d.totalProducts ?? 0).toLocaleString('en-IN'),
      icon:  Package,
      color: 'bg-purple-500',
      href:  '/admin/products',
    },
    {
      label: 'Customers',
      value: (d.totalUsers ?? 0).toLocaleString('en-IN'),
      icon:  Users,
      color: 'bg-amber-500',
      href:  '/admin/customers',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Dashboard</h1>
        <button onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-6 bg-gray-100 rounded w-2/3" />
              </div>
            ))
          : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-medium text-sm">Recent orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-[#0058A3] hover:underline">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={4} className="px-5 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td></tr>
                  ))
                ) : (d.recentOrders ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No orders yet. Orders will appear here once customers check out.
                  </td></tr>
                ) : (
                  (d.recentOrders ?? []).map((o: any) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-mono text-xs font-medium">{o.orderNumber}</td>
                      <td className="px-5 py-3 font-medium">{formatCurrency(Number(o.total))}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[o.status] ?? 'bg-gray-100'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(o.placedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock + Quick actions */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-medium text-sm mb-3">Quick actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Add new product',  href: '/admin/products/new' },
                { label: 'Add category',     href: '/admin/categories'   },
                { label: 'View all orders',  href: '/admin/orders'       },
                { label: 'View customers',   href: '/admin/customers'    },
              ].map((a) => (
                <Link key={a.href} href={a.href}
                  className="flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-[#0058A3] transition">
                  <span>{a.label}</span>
                  <ArrowRight size={13} />
                </Link>
              ))}
            </div>
          </div>

          {/* Low stock alert */}
          {!isLoading && (d.lowStockProducts ?? []).length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-100 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <h2 className="font-medium text-sm text-amber-800">Low stock alert</h2>
              </div>
              <ul className="divide-y divide-amber-100">
                {(d.lowStockProducts ?? []).map((p: any) => (
                  <li key={p.id} className="px-4 py-2 flex justify-between text-sm">
                    <span className="truncate mr-2 text-amber-900">{p.name}</span>
                    <span className={`font-medium flex-shrink-0 ${p.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} left`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
