'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import { productsApi } from '@/lib/api/products';
import { formatCurrency } from '@/lib/utils/format';
import { getApiErrorMessage } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';

export function AdminProductsPage() {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn:  () => adminApi.getProducts({ page, limit: 20, search: search || undefined }),
    staleTime: 30_000,
  });

  // Safely unwrap: API returns { success, data: { data: [...], meta: {...} } }
  const payload  = data?.data ?? data;
  const products: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];
  const meta = payload?.meta ?? { totalPages: 1, total: 0 };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess:  () => { toast.success('Product deleted'); qc.invalidateQueries({ queryKey: ['admin-products'] }); },
    onError:    (e: any) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-medium">Products</h1>
        <Link href="/admin/products/new"
          className="flex items-center gap-1.5 bg-[#0058A3] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#004f93] transition">
          <Plus size={14} /> Add product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="form-input pl-9 text-sm w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Price</th>
                <th className="px-5 py-3 text-left">Stock</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-14 text-center">
                  <Package size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-400 text-sm">No products yet.</p>
                  <Link href="/admin/products/new" className="text-[#0058A3] text-sm hover:underline mt-1 inline-block">
                    Add your first product →
                  </Link>
                </td></tr>
              ) : (
                products.map((p: any) => {
                  const img = p.images?.find((i: any) => i.isPrimary) ?? p.images?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {img?.url
                              ? <img src={img.url} alt="" className="w-full h-full object-cover" />
                              : <span className="text-lg">📦</span>}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{p.name}</p>
                            {p.sku && <p className="text-xs text-gray-400 font-mono">{p.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{p.category?.name ?? '—'}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{formatCurrency(Number(p.salePrice ?? p.basePrice))}</p>
                        {p.salePrice && (
                          <p className="text-xs text-gray-400 line-through">{formatCurrency(Number(p.basePrice))}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium ${
                          p.stockQuantity === 0
                            ? 'text-red-500'
                            : p.stockQuantity < 10
                            ? 'text-amber-500'
                            : 'text-green-600'
                        }`}>
                          {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} units`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {p.isFeatured && (
                          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${p.id}`}
                            className="flex items-center gap-1 text-xs border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition">
                            <Edit size={11} /> Edit
                          </Link>
                          <button
                            onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p.id); }}
                            className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{meta.total} products total</span>
            <div className="flex gap-1">
              {[...Array(Math.min(meta.totalPages, 8))].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded text-xs border transition ${
                    page === i + 1
                      ? 'bg-[#0058A3] text-white border-[#0058A3]'
                      : 'border-gray-200 hover:bg-gray-50'
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
