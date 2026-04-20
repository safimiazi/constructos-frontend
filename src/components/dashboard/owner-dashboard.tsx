'use client';

import Link from 'next/link';
import { FolderKanban, Users, TrendingUp, HardHat, ShoppingCart, ClipboardList } from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { SectionHeader } from './shared/section-header';
import { QuickLink } from './shared/quick-link';
import { useProjects } from '@/hooks/use-projects';
import { useEmployees } from '@/hooks/use-employees';
import { useInvoiceStats } from '@/hooks/use-finance';

const quickLinks = [
  { title: 'Projects',    desc: 'View all active projects',     href: '/dashboard/projects',        icon: FolderKanban },
  { title: 'HR',          desc: 'Employees & attendance',       href: '/dashboard/employees',       icon: HardHat      },
  { title: 'Finance',     desc: 'Invoices & budgets',           href: '/dashboard/invoices',        icon: TrendingUp   },
  { title: 'Procurement', desc: 'Purchase orders & vendors',    href: '/dashboard/purchase-orders', icon: ShoppingCart },
  { title: 'Tasks',       desc: 'Pending approvals & tasks',    href: '/dashboard/tasks',           icon: ClipboardList },
  { title: 'Users',       desc: 'Team members & roles',         href: '/dashboard/users',           icon: Users        },
];

const STATUS_COLOR: Record<string, string> = {
  planning: '#6b7280', active: '#22c55e', on_hold: '#f59e0b', completed: '#3b82f6', cancelled: '#ef4444',
};

export function OwnerDashboard() {
  const { data: projectsData, isLoading: pLoading } = useProjects({ status: 'active' });
  const { data: empData, isLoading: eLoading } = useEmployees();
  const { data: statsData } = useInvoiceStats();

  const projects = projectsData?.data?.data ?? [];
  const totalEmployees = empData?.data?.meta?.total ?? 0;
  const activeProjects = projectsData?.data?.meta?.total ?? 0;
  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Projects"  value={pLoading ? '…' : String(activeProjects)} change="In progress"     up icon={FolderKanban} color="purple" />
        <StatCard label="Total Employees"  value={eLoading ? '…' : String(totalEmployees)} change="All staff"       up icon={HardHat}      color="blue"   />
        <StatCard label="Total Invoiced"   value={stats ? `৳${Number(stats.totalInvoiced).toLocaleString()}` : '…'} change="All invoices" up icon={TrendingUp}   color="green"  />
        <StatCard label="Overdue Invoices" value={stats ? String(stats.overdueCount) : '…'} change="Needs action"  up={false} icon={ClipboardList} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="Active Projects" subtitle="Current progress" />
            <Link href="/dashboard/projects" className="text-xs hover:underline" style={{ color: 'var(--brand-500)' }}>View all →</Link>
          </div>
          {pLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'var(--bg-muted)' }} />)}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active projects. <Link href="/dashboard/projects" className="underline" style={{ color: 'var(--brand-500)' }}>Create one →</Link></p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: (STATUS_COLOR[p.status] ?? '#6b7280') + '20', color: STATUS_COLOR[p.status] ?? '#6b7280' }}>
                        {p.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{p.completionPercentage}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${p.completionPercentage}%`, background: STATUS_COLOR[p.status] ?? 'var(--brand-500)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <SectionHeader title="Quick Access" subtitle="Common actions" />
          <div className="flex flex-col gap-2 mt-3">
            {quickLinks.map((l) => <QuickLink key={l.href} {...l} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
