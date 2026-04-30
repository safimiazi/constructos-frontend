'use client';

import {
  Building2, Users, TrendingUp, Activity, AlertTriangle,
  CheckCircle2, Clock, ArrowUpRight, Zap, Globe,
  ShieldCheck, CreditCard, Settings, Megaphone, Flag,
  RefreshCw, Database, Cpu, Wifi, UserCheck,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { StatCard } from './shared/stat-card';
import { SectionHeader } from './shared/section-header';
import { QuickLink } from './shared/quick-link';
import {
  useSuperAdminStats, useSuperAdminGrowth, useSuperAdminTenantStatus,
  useSuperAdminPlanDist, useSuperAdminTopTenants,
} from '@/hooks/use-superadmin';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2, apiV3, setAccessToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 100000 ? `৳${(n / 100000).toFixed(1)}L` : `৳${n.toLocaleString()}`;

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    Enterprise: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    Professional: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    Starter: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[plan] ?? 'bg-gray-500/15 text-gray-400'}`}>
      {plan}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#22c55e', trial: '#9333ea', suspended: '#f59e0b', cancelled: '#ef4444',
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors[status] ?? '#6b7280' }} />
      <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{status}</span>
    </span>
  );
}

interface TooltipPayloadItem { name: string; value: number | string; color: string; }
interface TooltipProps { active?: boolean; payload?: TooltipPayloadItem[]; label?: string; }

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}</p>
      ))}
    </div>
  );
};

const QUICK_LINKS = [
  { title: 'Manage Tenants',   desc: 'View, suspend or impersonate', href: '/dashboard/organizations', icon: Building2 },
  { title: 'Billing & Plans',  desc: 'Subscriptions & pricing',      href: '/dashboard/packages',      icon: CreditCard },
  { title: 'Announcements',    desc: 'Broadcast to all tenants',     href: '/dashboard/announcements-manage', icon: Megaphone },
  { title: 'Audit Logs',       desc: 'Full platform activity trail', href: '/dashboard/audit-logs',    icon: ShieldCheck },
  { title: 'Users',            desc: 'All platform users',           href: '/dashboard/users',         icon: Users },
  { title: 'Settings',         desc: 'Global config',                href: '/dashboard/settings',      icon: Settings },
];

const PLATFORM_HEALTH = [
  { label: 'API Response',   value: '—',     status: 'info', icon: Wifi },
  { label: 'Error Rate',     value: '—',     status: 'info', icon: ShieldCheck },
  { label: 'DB Query Avg',   value: '—',     status: 'info', icon: Database },
  { label: 'Active Sessions',value: '—',     status: 'info', icon: Cpu },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function SuperAdminDashboard() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: statsData, isLoading: sLoading } = useSuperAdminStats();
  const { data: growthData } = useSuperAdminGrowth();
  const { data: statusData } = useSuperAdminTenantStatus();
  const { data: planDistData } = useSuperAdminPlanDist();
  const { data: topTenantsData } = useSuperAdminTopTenants();
  const { data: annoData } = useQuery({ queryKey: ['announcements'], queryFn: apiV2.getAnnouncements });

  const stats = statsData?.data;
  const growth = (growthData?.data as any[]) ?? [];
  const tenantStatus = (statusData?.data as any[]) ?? [];
  const planDist = (planDistData?.data as any[]) ?? [];
  const topTenants = (topTenantsData?.data as any[]) ?? [];
  const announcements = (annoData?.data as any[]) ?? [];

  const impersonate = useMutation({
    mutationFn: (tenantId: string) => apiV3.impersonateTenant(tenantId),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken);
      localStorage.setItem('cos_user', JSON.stringify(res.data.user));
      qc.clear();
      router.push('/dashboard');
    },
  });

  return (
    <div className="space-y-6">

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tenants"  value={sLoading ? '…' : String(stats?.totalTenants ?? 0)}  change={`${stats?.activeCount ?? 0} active`}  up icon={Building2}   color="purple" />
        <StatCard label="Total Users"    value={sLoading ? '…' : String(stats?.totalUsers ?? 0)}    change="All roles"       up icon={Users}       color="blue"   />
        <StatCard label="On Trial"       value={sLoading ? '…' : String(stats?.trialCount ?? 0)}    change="Free trial"      up icon={Clock}       color="cyan"   />
        <StatCard label="Suspended"      value={sLoading ? '…' : String(stats?.suspendedCount ?? 0)} change="Needs attention" up={false} icon={AlertTriangle} color="orange" />
      </div>

      {/* ── Status breakdown ─────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active',    value: stats.activeCount,    color: '#22c55e' },
            { label: 'Trial',     value: stats.trialCount,     color: '#9333ea' },
            { label: 'Suspended', value: stats.suspendedCount, color: '#f59e0b' },
            { label: 'Cancelled', value: stats.cancelledCount ?? 0, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts Row: Growth + Tenant Status ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <SectionHeader title="Tenant Growth" subtitle="Monthly signups & cumulative total" />
          <div className="mt-4 h-56">
            {growth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growth}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" name="Total Tenants" stroke="#9333ea" strokeWidth={2.5} fill="url(#growthGrad)" dot={{ r: 3, fill: '#9333ea' }} />
                  <Bar dataKey="signups" name="New Signups" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>No data yet</div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <SectionHeader title="Tenant Status" subtitle="Distribution by status" />
          <div className="mt-4 h-44 flex items-center justify-center">
            {tenantStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tenantStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {tenantStatus.map((entry: any) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tenants yet</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {tenantStatus.map((s: any) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.name}: <strong style={{ color: 'var(--text-primary)' }}>{s.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Plan Distribution ─────────────────────────────────────────────── */}
      {planDist.length > 0 && (
        <div className="card p-5">
          <SectionHeader title="Plan Distribution" subtitle="Tenants by subscription tier" />
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planDist} layout="vertical" barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Tenants" radius={[0, 6, 6, 0]}>
                  {planDist.map((d: any) => <Cell key={d.name} fill={d.color ?? '#9333ea'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Top Tenants + Recent Signups ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionHeader title="Top Tenants" subtitle="Most active companies" />
          <div className="overflow-x-auto mt-3">
            {topTenants.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tenants yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: 'var(--text-muted)' }}>
                    <th className="text-left pb-2 font-medium">Tenant</th>
                    <th className="text-left pb-2 font-medium">Plan</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-right pb-2 font-medium">Users</th>
                    <th className="text-right pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {topTenants.slice(0, 8).map((t: any) => (
                    <tr key={t.id} className="hover:bg-(--bg-muted) transition-colors">
                      <td className="py-2.5 pr-2 font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</td>
                      <td className="py-2.5 pr-2"><PlanBadge plan={t.planName} /></td>
                      <td className="py-2.5 pr-2"><StatusDot status={t.status} /></td>
                      <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{t.users}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => impersonate.mutate(t.id)} disabled={impersonate.isPending}
                          className="text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ml-auto"
                          style={{ borderColor: '#9333ea', color: '#9333ea' }}>
                          <UserCheck size={10} />Login
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card p-5">
          <SectionHeader title="Recent Signups" subtitle="Latest tenant registrations" />
          <div className="mt-3 space-y-2.5">
            {(stats?.recentTenants ?? []).length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tenants yet.</p>
            ) : (
              (stats?.recentTenants ?? []).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.companyName}</p>
                    <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>{t.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusDot status={t.status} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Expiring Trials ───────────────────────────────────────────────── */}
      {(stats?.expiringTrials ?? []).length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} style={{ color: '#f59e0b' }} />
            <SectionHeader title="Expiring Trials" subtitle="Tenants whose trial ends in the next 30 days" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(stats?.expiringTrials ?? []).map((t: any) => {
              const daysLeft = Math.ceil((new Date(t.trialEndsAt).getTime() - Date.now()) / 86400000);
              return (
                <div key={t.id} className="rounded-xl p-3" style={{ background: 'var(--bg-muted)', border: `1px solid ${daysLeft <= 7 ? '#ef444430' : '#f59e0b30'}` }}>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t.companyName}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.slug}</p>
                  <p className={`text-xs font-bold mt-2 ${daysLeft <= 7 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {daysLeft}d left — {new Date(t.trialEndsAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Announcements ─────────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Megaphone size={15} style={{ color: '#9333ea' }} />
            <SectionHeader title="Active Announcements" subtitle="Currently broadcasting to tenants" />
          </div>
          <a href="/dashboard/announcements-manage" className="text-xs hover:underline" style={{ color: 'var(--brand-500)' }}>Manage →</a>
        </div>
        {announcements.filter((a: any) => a.isActive).length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active announcements.</p>
        ) : (
          <div className="space-y-2">
            {announcements.filter((a: any) => a.isActive).map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${a.type === 'warning' ? 'bg-amber-500/15 text-amber-400' : a.type === 'maintenance' ? 'bg-rose-500/15 text-rose-400' : 'bg-blue-500/15 text-blue-400'}`}>
                  {a.type}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{a.message}</p>
                </div>
                {a.expiresAt && (
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                    Expires {new Date(a.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Platform Health (static — needs infra monitoring integration) ─── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} style={{ color: '#22c55e' }} />
          <SectionHeader title="Platform Health" subtitle="Infrastructure metrics (connect monitoring service for live data)" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PLATFORM_HEALTH.map(h => (
            <div key={h.label} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--bg-muted)' }}>
              <div className="flex items-center justify-between">
                <h.icon size={16} style={{ color: 'var(--text-muted)' }} />
                <RefreshCw size={13} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>{h.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Connect a monitoring service (Datadog, New Relic, etc.) to show live metrics here.
        </p>
      </div>

      {/* ── Quick Links ───────────────────────────────────────────────────── */}
      <div className="card p-5">
        <SectionHeader title="Quick Access" subtitle="Common admin actions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {QUICK_LINKS.map(l => <QuickLink key={l.href} {...l} />)}
        </div>
      </div>

    </div>
  );
}
