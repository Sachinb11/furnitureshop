import { apiClient, serverFetch } from './client';

// ── Server-side (used in Server Components / page.tsx) ──────────────────────
export async function getProducts(params?: Record<string, any>) {
  const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return serverFetch<any>(`/products${query}`);
}

export async function getProductBySlug(slug: string) {
  return serverFetch<any>(`/products/${slug}`, { revalidate: 300 });
}

export async function getFeaturedProducts(limit = 8) {
  return serverFetch<any>(`/products/featured?limit=${limit}`, { revalidate: 3600 });
}

// ── Client-side (used in 'use client' components) ──────────────────────────
export const productsApi = {
  getAll:      (params?: any) => apiClient.get('/products', { params }).then((r) => r.data),
  getBySlug:   (slug: string) => apiClient.get(`/products/${slug}`).then((r) => r.data),
  getFeatured: (limit = 8)   => apiClient.get(`/products/featured?limit=${limit}`).then((r) => r.data),
  create:      (data: any)   => apiClient.post('/products', data).then((r) => r.data),
  update:      (id: string, data: any) => apiClient.put(`/products/${id}`, data).then((r) => r.data),
  delete:      (id: string)  => apiClient.delete(`/products/${id}`).then((r) => r.data),
};
