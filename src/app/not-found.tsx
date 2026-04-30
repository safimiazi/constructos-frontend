import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-subtle)' }}>
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-6xl font-black" style={{ color: 'var(--brand-500)' }}>404</div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Page not found</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" className="btn-primary inline-block">Go to Dashboard</Link>
      </div>
    </div>
  );
}
