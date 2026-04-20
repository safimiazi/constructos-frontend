'use client';

import { useProjects } from '@/hooks/use-projects';
import { useEmployees } from '@/hooks/use-employees';
import { useInvoiceStats } from '@/hooks/use-finance';
import { PageHeader } from '@/components/ui/page-header';
import { BarChart3, FolderKanban, HardHat, TrendingUp, ShoppingCart } from 'lucide-react';

function StatBox({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: projectsData } = useProjects();
  const { data: empData } = useEmployees();
  const { data: statsData } = useInvoiceStats();

  const totalProjects = projectsData?.data?.meta?.total ?? 0;
  const activeProjects = projectsData?.data?.data?.filter((p: any) => p.status === 'active').length ?? 0;
  const totalEmployees = empData?.data?.meta?.total ?? 0;
  const stats = statsData?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Reports" subtitle="Business overview and analytics" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatBox label="Total Projects" value={String(totalProjects)} sub={`${activeProjects} active`} icon={FolderKanban} color="#9333ea" />
        <StatBox label="Total Employees" value={String(totalEmployees)} sub="All staff" icon={HardHat} color="#3b82f6" />
        <StatBox label="Total Invoiced" value={stats ? `৳${Number(stats.totalInvoiced).toLocaleString()}` : '—'} sub="All invoices" icon={TrendingUp} color="#16a34a" />
        <StatBox label="Overdue Invoices" value={stats ? String(stats.overdueCount) : '—'} sub="Needs attention" icon={ShoppingCart} color="#dc2626" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} style={{ color: 'var(--brand-500)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Project Status Breakdown</h2>
          </div>
          {['planning','active','on_hold','completed','cancelled'].map(status => {
            const count = projectsData?.data?.data?.filter((p: any) => p.status === status).length ?? 0;
            const pct = totalProjects ? Math.round((count / totalProjects) * 100) : 0;
            const colors: Record<string, string> = { planning: '#6b7280', active: '#22c55e', on_hold: '#f59e0b', completed: '#3b82f6', cancelled: '#ef4444' };
            return (
              <div key={status} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{status.replace('_',' ')}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: colors[status] }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: 'var(--brand-500)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Finance Summary</h2>
          </div>
          {stats && (
            <div className="space-y-4">
              {[
                { label: 'Total Invoiced', value: `৳${Number(stats.totalInvoiced).toLocaleString()}`, color: '#9333ea' },
                { label: 'Total Paid', value: `৳${Number(stats.totalPaid).toLocaleString()}`, color: '#16a34a' },
                { label: 'Outstanding', value: `৳${(Number(stats.totalInvoiced) - Number(stats.totalPaid)).toLocaleString()}`, color: '#f59e0b' },
                { label: 'Overdue Count', value: String(stats.overdueCount), color: '#dc2626' },
                { label: 'Draft Count', value: String(stats.draftCount), color: '#6b7280' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
