import Link from 'next/link';

const CATEGORIES = [
  { label: 'Living room', icon: '🛋️', href: '/products?categorySlug=living-room', color: 'bg-amber-50' },
  { label: 'Bedroom',     icon: '🛏️', href: '/products?categorySlug=bedroom',      color: 'bg-blue-50'   },
  { label: 'Dining',      icon: '🍽️', href: '/products?categorySlug=dining',       color: 'bg-green-50'  },
  { label: 'Storage',     icon: '📚', href: '/products?categorySlug=storage',      color: 'bg-purple-50' },
  { label: 'Office',      icon: '💻', href: '/products?categorySlug=office',       color: 'bg-red-50'    },
  { label: 'Outdoor',     icon: '🌿', href: '/products?categorySlug=outdoor',      color: 'bg-teal-50'   },
];

export function CategoryGrid() {
  return (
    <section>
      <h2 className="text-2xl font-medium mb-6">Shop by room</h2>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className={`${cat.color} rounded-xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform border border-transparent hover:border-gray-200`}
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-xs font-medium text-gray-700 text-center">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
