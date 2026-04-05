import type { Metadata } from 'next';
import { AdminProductsPage } from '@/components/admin/products/AdminProductsPage';
export const metadata: Metadata = { title: 'Products — Admin' };
export default function Products() { return <AdminProductsPage />; }
