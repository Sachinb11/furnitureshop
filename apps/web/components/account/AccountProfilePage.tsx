'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export function AccountProfilePage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-medium mb-6">My profile</h1>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EEF4FB] flex items-center justify-center text-[#0058A3] text-lg font-medium flex-shrink-0">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span
              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                user.role === 'admin' || user.role === 'super_admin'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <a
            href="/account/orders"
            className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-[#0058A3] transition"
          >
            <span>My orders</span>
            <span>→</span>
          </a>
          <a
            href="/account/wishlist"
            className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-[#0058A3] transition"
          >
            <span>My wishlist</span>
            <span>→</span>
          </a>
          {(user.role === 'admin' || user.role === 'super_admin') && (
            <a
              href="/admin"
              className="flex items-center justify-between py-2 text-sm text-[#0058A3]"
            >
              <span>Admin panel</span>
              <span>→</span>
            </a>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => {
              clearAuth();
              router.push('/');
            }}
            className="text-sm text-red-500 hover:text-red-600 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
