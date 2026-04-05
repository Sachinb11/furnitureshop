import { apiClient } from './client';

export const adminApi = {
  getDashboard: ()            => apiClient.get('/admin/dashboard').then((r) => r.data),
  getOrders:    (p?: any)     => apiClient.get('/admin/orders',   { params: p }).then((r) => r.data),
  getProducts:  (p?: any)     => apiClient.get('/admin/products', { params: p }).then((r) => r.data),
  getUsers:     (p?: any)     => apiClient.get('/admin/users',    { params: p }).then((r) => r.data),
};
