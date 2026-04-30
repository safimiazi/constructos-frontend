'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiV2 } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await apiV2.forgotPassword(email);
      setSent(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg-muted) 50%, var(--bg-subtle) 100%)' }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto text-white mb-3" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))' }}>C</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Forgot Password</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-lg" style={{ background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border)' }}>
              Reset link sent! Check your email.
            </div>
            <Link href="/login" className="btn-primary w-full block text-center">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input className="input-base" type="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {error && <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending…' : 'Send Reset Link'}</button>
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              <Link href="/login" className="hover:underline" style={{ color: 'var(--brand-600)' }}>← Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
