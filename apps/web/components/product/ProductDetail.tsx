'use client';
import { useState } from 'react';
import { ShoppingBag, Heart, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '@/types/index';
import { useCartStore } from '@/lib/store/cartStore';
import { formatCurrency } from '@/lib/utils/format';

interface Props {
  product: Product;
}

export function ProductDetail({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0]?.id ?? null
  );
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(
    product.images?.find((i) => i.isPrimary) ?? product.images?.[0]
  );
  const addItem = useCartStore((s) => s.addItem);

  const price = product.salePrice ? Number(product.salePrice) : Number(product.basePrice);
  const discount = product.salePrice
    ? Math.round(
        ((Number(product.basePrice) - price) / Number(product.basePrice)) * 100
      )
    : null;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant ?? undefined,
      name: product.name,
      price,
      quantity: qty,
      image: mainImg?.url,
    });
    toast.success('Added to cart!');
  };

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-2">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F0EDE8] mb-3 flex items-center justify-center">
          {mainImg?.url ? (
            <img
              src={mainImg.url}
              alt={mainImg.altText ?? product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl">🛋️</span>
          )}
        </div>

        {product.images?.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setMainImg(img)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                  mainImg?.id === img.id
                    ? 'border-[#0058A3]'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {img.url ? (
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">
                    🛋️
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.category?.name}</p>
          <h1 className="text-3xl font-medium">{product.name}</h1>
          {product.sku && (
            <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
          )}
        </div>

        {Number(product.avgRating) > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-amber-400">
              {'★'.repeat(Math.round(Number(product.avgRating)))}
              {'☆'.repeat(5 - Math.round(Number(product.avgRating)))}
            </span>
            <a href="#reviews" className="text-sm text-[#0058A3] hover:underline">
              {product.reviewCount} reviews
            </a>
          </div>
        )}

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium text-[#0058A3]">
              {formatCurrency(price)}
            </span>
            {product.salePrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(Number(product.basePrice))}
                </span>
                <span className="bg-red-100 text-red-700 text-xs font-medium px-1.5 py-0.5 rounded">
                  Save {discount}%
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
        </div>

        {product.variants && product.variants.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Select variant</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                    selectedVariant === v.id
                      ? 'border-[#0058A3] text-[#0058A3] bg-blue-50'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">Quantity</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-medium">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50"
            >
              +
            </button>
          </div>
          {product.stockQuantity < 10 && product.stockQuantity > 0 && (
            <span className="text-xs text-amber-600 font-medium">
              Only {product.stockQuantity} left!
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleAdd}
            disabled={product.stockQuantity === 0}
            className="flex items-center justify-center gap-2 bg-[#0058A3] text-white py-3.5 px-6 rounded-xl text-sm font-medium hover:bg-[#004f93] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={16} />
            {product.stockQuantity === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
          <button className="flex items-center justify-center gap-2 border border-gray-200 text-gray-900 py-3.5 px-6 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <Heart size={16} /> Save to wishlist
          </button>
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-[#0058A3] flex-shrink-0" />
            <span>Free delivery on orders over ₹10,000</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#0058A3] flex-shrink-0" />
            <span>1 year warranty · Easy 30-day returns</span>
          </div>
        </div>

        {product.description && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-medium mb-3">Specifications</h3>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-100">
                    <td className="py-2 text-gray-500 capitalize w-1/3">
                      {k.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2 font-medium">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
