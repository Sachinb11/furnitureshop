import type { Metadata } from 'next';
import { AccountProfilePage } from '@/components/account/AccountProfilePage';
export const metadata: Metadata = { title: 'My profile', robots: { index: false } };
export default function Profile() { return <AccountProfilePage />; }
