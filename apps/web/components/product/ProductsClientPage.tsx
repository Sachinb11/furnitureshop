'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import { ProductCard } from '@/components/product/ProductCard';

interface Filters {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  sortBy?: string;
  order?: string;
  [key: string]: any;
}

export function ProductsClientPage({ initialFilters }: { initialFilters: any }) {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 24,
    ...initialFilters,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
    staleTime: 30_000,
  });

  // Handle nested data shape from API
  const raw = data?.data ?? data;
  const products: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
  const meta = raw?.meta ?? data?.meta ?? { total: 0, totalPages: 1 };

  const updateFilter = (key: string, value: any) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-medium">
          {filters.search ? `Results for "${filters.search}"` : 'All furniture'}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{meta.total ?? 0} products</span>
          <select
            value={filters.sortBy ?? ''}
            onChange={(e) => updateFilter('sortBy', e.target.value || undefined)}
            className="form-input w-auto text-sm"
          >
            <option value="">Sort: Featured</option>
            <option value="basePrice">Price: Low to high</option>
            <option value="avgRating">Top rated</option>
            <option value="createdAt">Newest first</option>
          </select>
          <button
            className="flex items-center gap-1 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside
          className={`w-56 shrink-0 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}
        >
          {/* Search */}
          <div className="card p-4">
            <h3 className="text-sm font-medium mb-3">Search</h3>
            <input
              type="search"
              placeholder="Search products..."
              className="form-input text-sm"
              defaultValue={filters.search}
              onChange={(e) => updateFilter('search', e.target.value || undefined)}
            />
          </div>

          {/* Price */}
          <div className="card p-4">
            <h3 className="text-sm font-medium mb-3">Price range</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="form-input text-xs"
                onChange={(e) => updateFilter('minPrice', e.target.value || undefined)}
              />
              <input
                type="number"
                placeholder="Max"
                className="form-input text-xs"
                onChange={(e) => updateFilter('maxPrice', e.target.value || undefined)}
              />
            </div>
          </div>

          {/* Availability */}
          <div className="card p-4">
            <h3 className="text-sm font-medium mb-3">Availability</h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) =>
                  updateFilter('inStock', e.target.checked ? true : undefined)
                }
              />
              In stock only
            </label>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">No products found</p>
              <button
                onClick={() => setFilters({ page: 1, limit: 24 })}
                className="text-[#0058A3] hover:underline text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {products.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8 flex-wrap">
                  {[...Array(Math.min(meta.totalPages, 10))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                      className={`w-9 h-9 rounded-lg text-sm border transition ${
                        filters.page === i + 1
                          ? 'bg-[#0058A3] text-white border-[#0058A3]'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
