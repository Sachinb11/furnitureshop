import { apiClient } from './client';

export const cartApi = {
  get:        ()                           => apiClient.get('/cart').then((r) => r.data),
  addItem:    (d: { productId: string; quantity?: number; variantId?: string }) =>
              apiClient.post('/cart/items', d).then((r) => r.data),
  updateItem: (id: string, quantity: number) =>
              apiClient.patch(`/cart/items/${id}`, { quantity }).then((r) => r.data),
  removeItem: (id: string)                => apiClient.delete(`/cart/items/${id}`).then((r) => r.data),
  clear:      ()                          => apiClient.delete('/cart').then((r) => r.data),
};
