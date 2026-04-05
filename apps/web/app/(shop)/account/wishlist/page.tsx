import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My wishlist',
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-medium mb-6">My wishlist</h1>
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-4">♡</p>
        <p>Your wishlist is empty.</p>
        <a href="/products" className="mt-3 inline-block text-sm text-[#0058A3] hover:underline">
          Browse products
        </a>
      </div>
    </div>
  );
}
