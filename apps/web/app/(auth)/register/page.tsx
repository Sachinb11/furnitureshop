import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
export const metadata: Metadata = { title: 'Create account', robots: { index: false } };
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-medium"><span className="text-[#0058A3]">FURNI</span>SHOP</a>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-xl font-medium mb-6">Create your account</h1>
          <RegisterForm />
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <a href="/login" className="text-[#0058A3] hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
