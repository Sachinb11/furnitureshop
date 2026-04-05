import Link from 'next/link';

export function HeroBanner() {
  return (
    <section className="bg-[#F5F5F0]">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-12 lg:px-8 lg:py-20">
        <div className="flex-1">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#0058A3]">
            New collection 2024
          </p>
          <h1 className="mb-4 text-4xl font-medium leading-tight lg:text-5xl">
            New season.
            <br />
            New living room.
          </h1>
          <p className="mb-6 max-w-md text-base text-gray-600 leading-relaxed">
            Discover furniture that fits your space, your style, and your budget. Free delivery on
            orders over ₹10,000.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/products" className="btn-primary">
              Shop now
            </Link>
            <Link href="/products?isSale=true" className="btn-secondary">
              View offers
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-2/5 items-center justify-center">
          <div className="w-80 h-64 bg-[#E8E4DC] rounded-2xl flex items-center justify-center text-8xl">
            🛋️
          </div>
        </div>
      </div>
    </section>
  );
}
