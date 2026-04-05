'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { getApiErrorMessage } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const setAuth      = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login(form);
      // Handle both { data: { user, accessToken } } and { user, accessToken }
      const d = res?.data ?? res;

      if (!d?.accessToken || !d?.user) {
        throw new Error('Invalid response from server — missing token or user');
      }

      setAuth(d.user, d.accessToken, d.refreshToken ?? d.accessToken);
      toast.success(`Welcome back, ${d.user.firstName}!`);

      // Redirect
      const redirect = searchParams.get('redirect') ?? '/';
      const isAdmin  = d.user.role === 'admin' || d.user.role === 'super_admin';
      router.push(isAdmin ? '/admin/dashboard' : redirect);
      router.refresh();
    } catch (err: any) {
      const msg = getApiErrorMessage(err);

      // Specific error for network issues
      if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        toast.error(
          'Cannot reach the server. Make sure the backend is running on port 3001.',
          { duration: 5000 },
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Email address</label>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="form-input"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>

      <div>
        <label className="form-label">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="form-input pr-10"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#0058A3] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#004f93] transition disabled:opacity-60"
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign in'}
      </button>

      {/* Dev hint */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
        <p className="font-medium mb-0.5">Demo credentials</p>
        <p>Admin: <span className="font-mono">admin@furnishop.com</span> / <span className="font-mono">Admin@123</span></p>
        <p className="mt-1 text-blue-500">Backend must be running on <span className="font-mono">localhost:3001</span></p>
      </div>
    </form>
  );
}
