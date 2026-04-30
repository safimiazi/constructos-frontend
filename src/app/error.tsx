'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-subtle)' }}>
      <div className="card p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          ⚠️
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Something went wrong</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        {error.digest && (
          <p className="text-xs font-mono px-3 py-1.5 rounded" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <a href="/dashboard" className="btn-secondary">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
