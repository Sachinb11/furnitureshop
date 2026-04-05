import type { Metadata } from 'next';
import { OrderSuccessPage } from '@/components/checkout/OrderSuccessPage';
export const metadata: Metadata = { title: 'Order placed!', robots: { index: false } };
export default function Success({ searchParams }: { searchParams: { order?: string } }) {
  return <OrderSuccessPage orderId={searchParams.order} />;
}
