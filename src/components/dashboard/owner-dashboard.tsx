'use client';

import Link from 'next/link';
import { FolderKanban, Users, TrendingUp, HardHat, ShoppingCart, ClipboardList, AlertTriangle } from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { SectionHeader } from './shared/section-header';
import { QuickLink } from './shared/quick-link';
import { useQuery } from '@tanstack/react-query';
import { apiV3 } from '@/lib/api';
import { useEmployees } from '@/hooks/use-employees';
import { useInvoiceStats } from '@/hooks/use-finance';

const QUICK_LINKS = [
  { title: 'Projects',    desc: 'View all active projects',     href: '/dashboard/projects',        icon: FolderKanban },
  { title: 'HR',          desc: 'Employees & attendance',       href: '/dashboard/employees',       icon: HardHat      },
  { title: 'Finance',     desc: 'Invoices & budgets',           href: '/dashboard/invoices',        icon: TrendingUp   },
  { title: 'Procurement', desc: 'Purchase orders & vendors',    href: '/dashboard/purchase-orders', icon: ShoppingCart },
  { title: 'Tasks',       desc: 'Pending approvals & tasks',    href: '/dashboard/tasks',           icon: ClipboardList },
  { title: 'Users',       desc: 'Team members & roles',         href: '/dashboard/users',           icon: Users        },
];

const STATUS_COLORS: Record<string, string> = {
  planning: '#6b7280', active: '#22c55e', on_hold: '#f59e0b', completed: '#3b82f6', cancelled: '#ef4444',
};

export function OwnerDashboard() {
  const { data: dashData } = useQuery({ queryKey: ['project-dashboard'], queryFn: apiV3.getProjectDashboard });
  const { data: empData, isLoading: eLoading } = useEmployees();
  const { data: statsData } = useInvoiceStats();

  const dash = dashData?.data;
  const totalEmployees = empData?.data?.meta?.total ?? 0;
  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Projects"  value={dash ? String(dash.active) : '…'} change={dash?.overdueCount ? `${dash.overdueCount} overdue` : 'On track'} up={!dash?.overdueCount} icon={FolderKanban} color="purple" />
        <StatCard label="Total Employees"  value={eLoading ? '…' : String(totalEmployees)} change="All staff" up icon={HardHat} color="blue" />
        <StatCard label="Total Invoiced"   value={stats ? `৳${Number(stats.totalInvoiced).toLocaleString()}` : '…'} change="All invoices" up icon={TrendingUp} color="green" />
        <StatCard label="Overdue Invoices" value={stats ? String(stats.overdueCount) : '…'} change="Needs action" up={false} icon={ClipboardList} color="orange" />
      </div>

      {/* KPI row */}
      {dash && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Projects', value: String(dash.total), color: '#9333ea' },
            { label: 'Completed', value: String(dash.completed), color: '#16a34a' },
            { label: 'On Hold', value: String(dash.onHold), color: '#f59e0b' },
            { label: 'Avg Completion', value: `${dash.avgCompletion ?? 0}%`, color: '#3b82f6' },
            { label: 'Overdue Milestones', value: String(dash.overdueMilestones ?? 0), color: (dash.overdueMilestones ?? 0) > 0 ? '#dc2626' : '#16a34a' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent projects */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="Recent Projects" subtitle="Latest activity" />
            <Link href="/dashboard/projects" className="text-xs hover:underline" style={{ color: 'var(--brand-500)' }}>View all →</Link>
          </div>
          {!dash?.recentProjects?.length ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No projects yet.{' '}
              <Link href="/dashboard/projects" className="underline" style={{ color: 'var(--brand-500)' }}>Create one →</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {dash.recentProjects.slice(0, 5).map((p: any) => {
                const color = STATUS_COLORS[p.status] ?? '#6b7280';
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/dashboard/projects/${p.id}`} className="text-sm font-medium hover:underline truncate" style={{ color: 'var(--brand-500)' }}>
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {p.overdueCount > 0 && <AlertTriangle size={12} style={{ color: '#f59e0b' }} />}
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: color + '20', color }}>
                          {p.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{p.completionPercentage}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${p.completionPercentage}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="card p-5">
          <SectionHeader title="Quick Access" subtitle="Common actions" />
          <div className="flex flex-col gap-2 mt-3">
            {QUICK_LINKS.map((l) => <QuickLink key={l.href} {...l} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
