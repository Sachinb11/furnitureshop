import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SchemaMarkup } from '@/components/common/SchemaMarkup';

interface Props {
  params: { slug: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product not found' };

  return {
    title:       product.metaTitle       ?? product.name,
    description: product.metaDescription ?? product.description?.slice(0, 160),
    openGraph: {
      title:       product.name,
      description: product.description?.slice(0, 160),
      images:      product.images?.[0]?.url
        ? [{ url: product.images[0].url }]
        : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/products/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const crumbs = [
    { label: 'Home',     href: '/' },
    { label: product.category?.name ?? 'Products', href: `/products` },
    { label: product.name },
  ];

  return (
    <>
      <SchemaMarkup type="Product" data={product} />
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        <Breadcrumb items={crumbs} />
        <ProductDetail product={product} />
      </div>
    </>
  );
}
