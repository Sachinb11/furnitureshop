import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <div className="text-xl font-medium text-white mb-3">
              <span className="text-[#0058A3]">FURNI</span>SHOP
            </div>
            <p className="text-sm leading-relaxed">
              Quality furniture for every home, delivered across India.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              {['Living room', 'Bedroom', 'Dining', 'Storage', 'Offers'].map((c) => (
                <li key={c}>
                  <Link href="/products" className="hover:text-white transition">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Help</h3>
            <ul className="space-y-2 text-sm">
              {['Contact us', 'Returns', 'Track order', 'FAQ'].map((c) => (
                <li key={c}>
                  <Link href="#" className="hover:text-white transition">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              {['About us', 'Careers', 'Privacy policy', 'Terms'].map((c) => (
                <li key={c}>
                  <Link href="#" className="hover:text-white transition">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6 text-xs text-center">
          © {new Date().getFullYear()} Furnishop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
