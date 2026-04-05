import { apiClient, serverFetch } from './client';

export async function getCategories() {
  return serverFetch<any>('/categories', { revalidate: 3600 });
}

export const categoriesApi = {
  getAll:    ()             => apiClient.get('/categories').then((r) => r.data),
  getBySlug: (slug: string) => apiClient.get(`/categories/${slug}`).then((r) => r.data),
  create:    (data: any)    => apiClient.post('/categories', data).then((r) => r.data),
  update:    (id: string, data: any) => apiClient.put(`/categories/${id}`, data).then((r) => r.data),
  delete:    (id: string)   => apiClient.delete(`/categories/${id}`).then((r) => r.data),
};
