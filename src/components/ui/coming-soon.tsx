import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">{title}</h1>
      <div className="card p-12 text-center">
        <Construction size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-500)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Coming Soon</p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          {description ?? 'This module is under development. Check back soon.'}
        </p>
      </div>
    </div>
  );
}
