'use client';

import Link from 'next/link';
import { ClipboardList, CalendarDays, FolderKanban, Bell } from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { SectionHeader } from './shared/section-header';
import { useQuery } from '@tanstack/react-query';
import { apiClient, apiV3 } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export function StaffDashboard() {
  const { user } = useAuth();

  const { data: projectsData } = useQuery({
    queryKey: ['staff-projects'],
    queryFn: () => apiClient.getProjects({ limit: 10 }),
    enabled: !!user,
  });

  const { data: notifData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: apiClient.getUnreadCount,
    enabled: !!user,
  });

  const { data: leavesData } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: () => apiClient.getLeaves(),
    enabled: !!user,
  });

  const projects = projectsData?.data?.data ?? [];
  const unreadCount = notifData?.data?.count ?? 0;
  const leaves = (leavesData?.data as any[]) ?? [];
  const pendingLeaves = leaves.filter((l: any) => l.status === 'pending').length;
  const approvedLeaves = leaves.filter((l: any) => l.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="My Projects"      value={String(projectsData?.data?.meta?.total ?? 0)} change="Assigned to me"  up icon={FolderKanban} color="purple" />
        <StatCard label="Approved Leaves"  value={String(approvedLeaves)}  change="This year"       up icon={CalendarDays}  color="green"  />
        <StatCard label="Pending Leaves"   value={String(pendingLeaves)}   change="Awaiting approval" up={pendingLeaves === 0} icon={CalendarDays} color="blue" />
        <StatCard label="Notifications"    value={String(unreadCount)}     change="Unread"          up={false} icon={Bell}  color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="My Projects" subtitle="Assigned to me" />
            <Link href="/dashboard/projects" className="text-xs hover:underline" style={{ color: 'var(--brand-500)' }}>
              View all →
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No projects assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((p: any) => {
                const colors: Record<string, string> = { active: '#22c55e', planning: '#6b7280', on_hold: '#f59e0b', completed: '#3b82f6', cancelled: '#ef4444' };
                const color = colors[p.status] ?? '#6b7280';
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/dashboard/projects/${p.id}`} className="text-sm font-medium hover:underline truncate" style={{ color: 'var(--brand-500)' }}>
                        {p.name}
                      </Link>
                      <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: 'var(--text-muted)' }}>{p.completionPercentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${p.completionPercentage}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="My Leave Requests" subtitle="Recent requests" />
            <Link href="/dashboard/leaves" className="text-xs hover:underline" style={{ color: 'var(--brand-500)' }}>
              View all →
            </Link>
          </div>
          {leaves.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No leave requests yet.</p>
          ) : (
            <div className="space-y-2">
              {leaves.slice(0, 5).map((l: any) => (
                <div key={l.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{l.leaveType?.replace('_', ' ')} Leave</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()} ({l.totalDays}d)
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{
                    background: l.status === 'approved' ? 'rgba(34,197,94,0.12)' : l.status === 'rejected' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                    color: l.status === 'approved' ? '#16a34a' : l.status === 'rejected' ? '#dc2626' : '#d97706',
                  }}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
