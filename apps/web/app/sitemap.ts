import { MetadataRoute } from 'next';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=200&isActive=true`, { next: { revalidate: 86400 } });
    if (res.ok) {
      const json = await res.json();
      const productRoutes: MetadataRoute.Sitemap = (json.data || []).map((p: any) => ({
        url: `${BASE}/products/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: p.isFeatured ? 0.9 : 0.7,
      }));
      return [...staticRoutes, ...productRoutes];
    }
  } catch {}
  return staticRoutes;
}
