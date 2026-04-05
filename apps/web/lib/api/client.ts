import axios, { AxiosError } from 'axios';

// ── API base URL ────────────────────────────────────────────────────────────
// NEXT_PUBLIC_ prefix makes it available both server-side and client-side
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// ── Axios instance ──────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL:         API_BASE,
  timeout:         15000,
  withCredentials: false, // set true if using cookie-based auth
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue:  { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });

        const newToken = data?.data?.accessToken ?? data?.accessToken;
        if (!newToken) throw new Error('No new token returned');

        localStorage.setItem('access_token', newToken);
        if (data?.data?.refreshToken ?? data?.refreshToken) {
          localStorage.setItem('refresh_token', data?.data?.refreshToken ?? data?.refreshToken);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Only redirect if not already on auth pages
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Server-side fetch (Next.js Server Components) ───────────────────────────
export async function serverFetch<T>(
  path: string,
  options?: RequestInit & { revalidate?: number | false },
): Promise<T> {
  const { revalidate, ...fetchOptions } = options ?? {};

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(fetchOptions.headers ?? {}),
    },
    next: { revalidate: revalidate ?? 60 },
  });

  if (!res.ok) {
    // Don't throw — return empty so pages don't crash
    console.error(`[serverFetch] ${res.status} ${path}`);
    return null as unknown as T;
  }

  const json = await res.json();
  return json.data ?? json;
}

// ── Helper to extract API error message ────────────────────────────────────
export function getApiErrorMessage(err: any): string {
  const msg = err?.response?.data?.message ?? err?.message ?? 'Something went wrong';
  return Array.isArray(msg) ? msg[0] : msg;
}
