import { apiClient } from './client';

export const ordersApi = {
  create:       (d: any)                      => apiClient.post('/orders', d).then((r) => r.data),
  getAll:       (params?: any)                => apiClient.get('/orders', { params }).then((r) => r.data),
  getById:      (id: string)                  => apiClient.get(`/orders/${id}`).then((r) => r.data),
  updateStatus: (id: string, status: string)  => apiClient.patch(`/orders/${id}/status`, { status }).then((r) => r.data),
};
