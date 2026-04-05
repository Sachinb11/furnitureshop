'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '@/types/index';
import { useCartStore } from '@/lib/store/cartStore';
import { formatCurrency } from '@/lib/utils/format';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const [wishlisted, setWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const price = product.salePrice ? Number(product.salePrice) : Number(product.basePrice);
  const discount = product.salePrice
    ? Math.round(
        ((Number(product.basePrice) - Number(product.salePrice)) / Number(product.basePrice)) * 100
      )
    : null;
  const img = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: 1,
      image: img?.url,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 transition">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-[#F0EDE8] flex items-center justify-center overflow-hidden">
          {img?.url ? (
            <img
              src={img.url}
              alt={img.altText ?? product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-6xl">🛋️</span>
          )}
          {discount !== null && (
            <span className="absolute left-2 top-2 bg-[#E00751] text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
              −{discount}%
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWishlisted(!wishlisted);
            }}
            className={`absolute right-2 top-2 rounded-full bg-white p-1.5 opacity-0 group-hover:opacity-100 transition ${
              wishlisted ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-xs text-gray-500 mb-2 truncate">
            {product.description?.slice(0, 50)}
          </p>
          {Number(product.avgRating) > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-amber-400 text-xs">
                {'★'.repeat(Math.round(Number(product.avgRating)))}
              </span>
              <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">{formatCurrency(price)}</span>
            {product.salePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(Number(product.basePrice))}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stockQuantity === 0}
            className="w-full bg-[#0058A3] text-white text-xs font-medium py-2 rounded-lg hover:bg-[#004f93] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stockQuantity === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
