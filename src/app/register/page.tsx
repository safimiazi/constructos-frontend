'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ApiError, setAccessToken } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function RegisterPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: '', slug: '',
    firstName: '', lastName: '', email: '', password: '', phone: '',
  });

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await apiClient.register(form);
      setAccessToken(res.data.accessToken);
      localStorage.setItem('cos_user', JSON.stringify(res.data.user));
      qc.setQueryData(['auth', 'user'], res.data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg-muted) 50%, var(--bg-subtle) 100%)' }}>
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
      <div className="relative w-full max-w-lg rounded-2xl p-8"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto text-white mb-3"
            style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))' }}>C</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Register your company</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Start your 14-day free trial on ConstructOS</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: step >= s ? 'var(--brand-600)' : 'var(--bg-muted)', color: step >= s ? '#fff' : 'var(--text-muted)' }}>
                {s}
              </div>
              <span className="text-xs" style={{ color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {s === 1 ? 'Company Info' : 'Admin Account'}
              </span>
              {s < 2 && <div className="flex-1 h-px" style={{ background: step > s ? 'var(--brand-500)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Company Name *</label>
                <input className="input-base" placeholder="ABC Construction Ltd" required value={form.companyName}
                  onChange={e => { f('companyName')(e); setForm(p => ({ ...p, slug: autoSlug(e.target.value) })); }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Subdomain (slug) *
                  <span className="ml-1 font-normal" style={{ color: 'var(--text-muted)' }}>— your-slug.constructos.app</span>
                </label>
                <input className="input-base font-mono" placeholder="abc-construction" required value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: autoSlug(e.target.value) }))} />
              </div>
              <button type="submit" className="btn-primary w-full">Continue →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>First Name *</label>
                  <input className="input-base" required value={form.firstName} onChange={f('firstName')} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Last Name *</label>
                  <input className="input-base" required value={form.lastName} onChange={f('lastName')} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                <input className="input-base" type="email" required value={form.email} onChange={f('email')} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password *</label>
                <input className="input-base" type="password" minLength={8} required value={form.password} onChange={f('password')} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                <input className="input-base" type="tel" value={form.phone} onChange={f('phone')} />
              </div>

              {error && (
                <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating account…' : 'Create Account'}</button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="hover:underline" style={{ color: 'var(--brand-600)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
