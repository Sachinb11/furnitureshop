import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types/index';

interface Props {
  products: Product[];
}

export function FeaturedProducts({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-48 bg-gray-100 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
