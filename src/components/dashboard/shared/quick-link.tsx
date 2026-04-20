import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function QuickLink({ title, desc, href, icon: Icon }: {
  title: string; desc: string; href: string; icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="card p-4 flex items-center gap-3 hover:border-(--brand-400) hover:shadow-[0_4px_20px_rgba(147,51,234,0.15)] transition-all group"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-(--bg-muted) group-hover:bg-linear-to-br group-hover:from-purple-600 group-hover:to-purple-800 transition-all">
        <Icon size={17} className="text-(--text-secondary) group-hover:text-white transition-colors" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-(--text-primary)">{title}</p>
        <p className="text-xs text-(--text-muted) truncate">{desc}</p>
      </div>
      <ArrowUpRight size={15} className="ml-auto shrink-0 text-(--text-muted) group-hover:text-purple-500 transition-colors" />
    </Link>
  );
}
