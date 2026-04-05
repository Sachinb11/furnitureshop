import type { Metadata } from 'next';
import { AdminProductFormPage } from '@/components/admin/products/AdminProductFormPage';

export const metadata: Metadata = { title: 'Edit Product — Admin' };

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <AdminProductFormPage productId={params.id} />;
}
