'use client';

import Link from 'next/link';
import { Building2, Users, TrendingUp, Package, BarChart3, ClipboardList, Megaphone, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { QuickLink } from './shared/quick-link';
import { SectionHeader } from './shared/section-header';
import { useSuperAdminStats } from '@/hooks/use-superadmin';

const quickLinks = [
  { title: 'Tenants',       desc: 'View & manage all companies',  href: '/dashboard/organizations', icon: Building2    },
  { title: 'Plans',         desc: 'Manage subscription plans',    href: '/dashboard/packages',      icon: Package      },
  { title: 'Users',         desc: 'All platform users',           href: '/dashboard/users',         icon: Users        },
  { title: 'Audit Logs',    desc: 'Platform-wide activity',       href: '/dashboard/audit-logs',    icon: ClipboardList },
  { title: 'Reports',       desc: 'Revenue & subscription data',  href: '/dashboard/reports',       icon: BarChart3    },
  { title: 'Announcements', desc: 'Broadcast to all tenants',     href: '/dashboard/announcements', icon: Megaphone    },
];

const STATUS_ICON: Record<string, React.ElementType> = {
  active: CheckCircle, trial: AlertCircle, suspended: XCircle, cancelled: XCircle,
};
const STATUS_COLOR: Record<string, string> = {
  active: '#22c55e', trial: '#f59e0b', suspended: '#ef4444', cancelled: '#6b7280',
};

export function SuperAdminDashboard() {
  const { data, isLoading } = useSuperAdminStats();
  const stats = data?.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tenants"   value={isLoading ? '…' : String(stats?.totalTenants ?? 0)}   change="All companies"   up icon={Building2}  color="purple" />
        <StatCard label="Active"          value={isLoading ? '…' : String(stats?.activeCount ?? 0)}    change="Paid tenants"    up icon={TrendingUp} color="green"  />
        <StatCard label="On Trial"        value={isLoading ? '…' : String(stats?.trialCount ?? 0)}     change="Trial period"    up icon={Package}    color="blue"   />
        <StatCard label="Total Users"     value={isLoading ? '…' : String(stats?.totalUsers ?? 0)}     change="All tenants"     up icon={Users}      color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionHeader title="Quick Access" subtitle="SuperAdmin panel" />
          <div className="flex flex-col gap-2 mt-3">
            {quickLinks.map((l) => <QuickLink key={l.href} {...l} />)}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="Recent Tenants" subtitle="Latest signups" />
            <Link href="/dashboard/organizations" className="text-xs hover:underline" style={{ color: 'var(--brand-500)' }}>
              View all →
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--bg-muted)' }} />)}
            </div>
          ) : (stats?.recentTenants ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tenants yet.</p>
          ) : (
            <div className="space-y-0">
              {(stats?.recentTenants ?? []).map((t) => {
                const Icon = STATUS_ICON[t.status] ?? AlertCircle;
                return (
                  <div key={t.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.companyName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.slug} · {new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <Icon size={13} style={{ color: STATUS_COLOR[t.status] }} />
                      <span className="text-xs capitalize" style={{ color: STATUS_COLOR[t.status] }}>{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
