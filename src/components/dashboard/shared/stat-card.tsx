import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const gradients: Record<string, string> = {
  purple: 'from-purple-500 to-purple-700',
  blue:   'from-blue-500 to-blue-700',
  green:  'from-emerald-500 to-emerald-700',
  orange: 'from-orange-500 to-orange-600',
  rose:   'from-rose-500 to-rose-600',
  cyan:   'from-cyan-500 to-cyan-600',
};

export interface StatCardProps {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ElementType;
  color: keyof typeof gradients;
}

export function StatCard({ label, value, change, up, icon: Icon, color }: StatCardProps) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-linear-to-br ${gradients[color]} shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-(--text-muted) uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-(--text-primary) mt-0.5">{value}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${up ? 'text-emerald-500' : 'text-rose-400'}`}>
          {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          <span>{change} vs last month</span>
        </div>
      </div>
    </div>
  );
}
