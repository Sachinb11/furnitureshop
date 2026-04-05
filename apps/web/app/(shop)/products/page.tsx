import type { Metadata } from 'next';
import { ProductsClientPage } from '@/components/product/ProductsClientPage';

export function generateMetadata({ searchParams }: { searchParams: any }): Metadata {
  const search = searchParams?.search;
  if (search) return { title: `"${search}" — Search results`, robots: { index: false } };
  return {
    title: 'All furniture',
    description: 'Browse our full range of furniture — sofas, beds, dining tables, storage and more.',
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products` },
  };
}

export default function ProductsPage({ searchParams }: { searchParams: any }) {
  return <ProductsClientPage initialFilters={searchParams} />;
}
