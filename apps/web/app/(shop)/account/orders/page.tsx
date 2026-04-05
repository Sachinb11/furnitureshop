import type { Metadata } from 'next';
import { AccountOrdersPage } from '@/components/account/AccountOrdersPage';
export const metadata: Metadata = { title: 'My orders', robots: { index: false } };
export default function Orders() { return <AccountOrdersPage />; }
