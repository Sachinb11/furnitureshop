import { apiClient } from './client';

export const paymentsApi = {
  initiate: (orderId: string) =>
    apiClient.post(`/payments/initiate/${orderId}`).then((r) => r.data),
  verify: (d: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    apiClient.post('/payments/verify', d).then((r) => r.data),
};
