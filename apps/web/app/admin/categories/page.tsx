import type { Metadata } from 'next';
import { AdminCategoriesPage } from '@/components/admin/AdminCategoriesPage';
export const metadata: Metadata = { title: 'Categories — Admin' };
export default function Categories() { return <AdminCategoriesPage />; }
