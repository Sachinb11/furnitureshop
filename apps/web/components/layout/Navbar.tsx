'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { CartDrawer } from '@/components/cart/CartDrawer';

const NAV_LINKS = [
  { label: 'Living room', href: '/products?categorySlug=living-room' },
  { label: 'Bedroom',     href: '/products?categorySlug=bedroom'      },
  { label: 'Dining',      href: '/products?categorySlug=dining'       },
  { label: 'Storage',     href: '/products?categorySlug=storage'      },
  { label: 'Offers',      href: '/products?isSale=true'               },
];

export function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount);
  const { user, clearAuth } = useAuthStore();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        {/* Top bar */}
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden mr-2 p-1 rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl font-medium tracking-tight flex-shrink-0">
            <span className="text-[#0058A3]">FURNI</span>SHOP
          </Link>

          {/* Desktop search */}
          <div className="hidden lg:flex flex-1 mx-8">
            <div className="relative w-full max-w-lg">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="search"
                placeholder="Search furniture..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) window.location.href = `/products?search=${encodeURIComponent(val)}`;
                  }
                }}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-[#0058A3] focus:outline-none"
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {user ? (
              <div className="hidden lg:flex items-center gap-1">
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Link
                    href="/admin"
                    className="text-xs text-[#0058A3] border border-[#0058A3] px-2 py-1 rounded mr-1 hover:bg-blue-50 transition"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/account/orders"
                  className="rounded-lg p-2 hover:bg-gray-100 transition"
                >
                  <User size={20} />
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:block text-sm text-gray-600 hover:text-gray-900 mr-2"
              >
                Sign in
              </Link>
            )}

            {/* Cart button */}
            <button
              className="relative rounded-lg p-2 hover:bg-gray-100 transition"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0058A3] text-[10px] font-medium text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop category nav */}
        <nav className="hidden lg:block border-t border-gray-100">
          <div className="mx-auto flex max-w-7xl items-center px-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 pb-4 bg-white">
            <div className="relative mb-3 mt-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      window.location.href = `/products?search=${encodeURIComponent(val)}`;
                      setMobileOpen(false);
                    }
                  }
                }}
              />
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              {user ? (
                <>
                  <Link
                    href="/account/orders"
                    className="block py-2 text-sm text-gray-600"
                    onClick={() => setMobileOpen(false)}
                  >
                    My orders
                  </Link>
                  {(user.role === 'admin' || user.role === 'super_admin') && (
                    <Link
                      href="/admin"
                      className="block py-2 text-sm text-[#0058A3]"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      clearAuth();
                      setMobileOpen(false);
                    }}
                    className="block py-2 text-sm text-red-500"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block py-2 text-sm text-[#0058A3]"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
