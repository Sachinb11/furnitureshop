'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  LogOut,
  FolderOpen,
  Home,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders',    href: '/admin/orders',    icon: ShoppingBag     },
  { label: 'Products',  href: '/admin/products',  icon: Package         },
  { label: 'Categories',href: '/admin/categories',icon: FolderOpen      },
  { label: 'Customers', href: '/admin/customers', icon: Users           },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/');
    }
  }, [user, router]);

  // Don't render anything while checking auth
  if (!user) return null;
  if (user.role !== 'admin' && user.role !== 'super_admin') return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <Link href="/" className="text-base font-medium hover:opacity-80 transition">
            <span className="text-[#0058A3]">FURNI</span>SHOP
            <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 font-normal">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map((item) => {
            const Icon   = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm border-l-2 transition ${
                  active
                    ? 'border-[#0058A3] bg-blue-50 text-[#0058A3] font-medium'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <Home size={12} /> Back to store
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#0058A3] text-xs font-medium flex-shrink-0">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="text-xs min-w-0">
              <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>

          <button
            onClick={() => {
              clearAuth();
              router.push('/');
            }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
