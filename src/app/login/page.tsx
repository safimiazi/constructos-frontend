'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();
  const { login, isLoginPending, loginError } = useAuth();

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      // Clear old session data before login
      localStorage.removeItem('cos_user');
      localStorage.removeItem('cos_access_token');
      localStorage.removeItem('cos_refresh_token');
      await login(email, password);
      router.push('/dashboard');
    } catch { /* surfaced via loginError */ }
  };

  const errorMsg =
    loginError instanceof ApiError
      ? loginError.status === 401 ? 'Invalid email or password.' : loginError.message
      : loginError ? 'Something went wrong. Please try again.' : null;

  return (
    <AuthLayout>
      <div className="animate-fade-in space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', boxShadow: '0 4px 16px rgba(147,51,234,0.4)' }}>
            C
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your ConstructOS account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email address
            </label>
            <input type="email" autoComplete="email" className="input-base"
              style={errors.email ? { borderColor: 'var(--error-text)' } : {}}
              placeholder="you@company.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }} />
            {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--error-text)' }}>{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input type="password" autoComplete="current-password" className="input-base"
              style={errors.password ? { borderColor: 'var(--error-text)' } : {}}
              placeholder="••••••••" value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }} />
            {errors.password && <p className="mt-1 text-xs" style={{ color: 'var(--error-text)' }}>{errors.password}</p>}
          </div>

          {errorMsg && (
            <div className="rounded-lg px-4 py-3 text-sm"
              style={{ background: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={isLoginPending} className="btn-primary w-full mt-2">
            {isLoginPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <a href="/forgot-password" style={{ color: 'var(--brand-600)' }} className="hover:underline text-xs">
            Forgot password?
          </a>
          <a href="/register" style={{ color: 'var(--text-muted)' }} className="hover:underline text-xs">
            Register your company →
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLayout><div className="h-48" /></AuthLayout>}>
      <LoginForm />
    </Suspense>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg-muted) 50%, var(--bg-subtle) 100%)' }}>
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(126,34,206,0.1) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
      <div className="relative w-full max-w-md rounded-2xl p-8"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        {children}
      </div>
    </div>
  );
}
