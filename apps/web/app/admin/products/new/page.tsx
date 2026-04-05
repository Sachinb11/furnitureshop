import type { Metadata } from 'next';
import { AdminProductFormPage } from '@/components/admin/products/AdminProductFormPage';
export const metadata: Metadata = { title: 'Add Product — Admin' };
export default function NewProduct() { return <AdminProductFormPage />; }
