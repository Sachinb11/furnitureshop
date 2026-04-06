import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: 'Login', robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-medium">
            <span className="text-[#0058A3]">FURNI</span>SHOP
          </a>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-xl font-medium mb-6">Sign in to your account</h1>
          <LoginForm />
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <a href="/register" className="text-[#0058A3] hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}