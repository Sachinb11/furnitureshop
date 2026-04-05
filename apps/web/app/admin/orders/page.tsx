import type { Metadata } from 'next';
import { AdminOrdersPage } from '@/components/admin/orders/AdminOrdersPage';
export const metadata: Metadata = { title: 'Orders — Admin' };
export default function Orders() { return <AdminOrdersPage />; }
