'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="card p-8 max-w-md w-full text-center space-y-3">
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Failed to load this page</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="btn-primary">Retry</button>
      </div>
    </div>
  );
}
