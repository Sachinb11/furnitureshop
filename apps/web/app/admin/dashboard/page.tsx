import type { Metadata } from 'next';
import { AdminDashboardPage } from '@/components/admin/dashboard/AdminDashboardPage';
export const metadata: Metadata = { title: 'Dashboard — Admin' };
export default function Dashboard() { return <AdminDashboardPage />; }
