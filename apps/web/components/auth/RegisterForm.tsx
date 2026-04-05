'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { getApiErrorMessage } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function RegisterForm() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    password:  '',
    phone:     '',
  });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);

  const f =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register(form);
      const d   = res?.data ?? res;

      if (!d?.accessToken || !d?.user) {
        throw new Error('Invalid response from server');
      }

      setAuth(d.user, d.accessToken, d.refreshToken ?? d.accessToken);
      toast.success('Account created! Welcome to Furnishop.');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        toast.error('Cannot reach server. Ensure backend is running on port 3001.', { duration: 5000 });
      } else {
        toast.error(getApiErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">First name *</label>
          <input required className="form-input" placeholder="Rahul"
            value={form.firstName} onChange={f('firstName')} />
        </div>
        <div>
          <label className="form-label">Last name *</label>
          <input required className="form-input" placeholder="Sharma"
            value={form.lastName} onChange={f('lastName')} />
        </div>
      </div>

      <div>
        <label className="form-label">Email *</label>
        <input type="email" required autoComplete="email" className="form-input"
          placeholder="you@example.com" value={form.email} onChange={f('email')} />
      </div>

      <div>
        <label className="form-label">Phone</label>
        <input type="tel" className="form-input" placeholder="+91 98765 43210"
          value={form.phone} onChange={f('phone')} />
      </div>

      <div>
        <label className="form-label">Password *</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            className="form-input pr-10"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={f('password')}
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#0058A3] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#004f93] transition disabled:opacity-60"
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create account'}
      </button>
    </form>
  );
}
