import type { Metadata } from 'next';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';

export const metadata: Metadata = {
  title: 'Furnishop — Quality furniture for every home',
  description:
    'Discover thousands of furniture pieces at affordable prices. Free delivery on orders above ₹10,000.',
};

export const revalidate = 3600;

async function getFeatured() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
    const res = await fetch(`${apiUrl}/products/featured`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      <HeroBanner />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <CategoryGrid />
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">Featured products</h2>
            <a
              href="/products?isFeatured=true"
              className="text-sm text-[#0058A3] hover:underline"
            >
              See all →
            </a>
          </div>
          <FeaturedProducts products={featured} />
        </section>
      </div>
    </>
  );
}
