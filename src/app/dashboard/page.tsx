'use client';

import { useAuth } from '@/hooks/use-auth';
import { SuperAdminDashboard } from '@/components/dashboard/super-admin-dashboard';
import { OwnerDashboard } from '@/components/dashboard/owner-dashboard';
import { StaffDashboard } from '@/components/dashboard/staff-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Good morning, {user.firstName} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Here&apos;s your ConstructOS workspace overview.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          {user.role.replace(/_/g, ' ')}
        </span>
      </div>

      {user.isSuperAdmin ? (
        <SuperAdminDashboard />
      ) : ['OWNER', 'ADMIN'].includes(user.role) ? (
        <OwnerDashboard />
      ) : (
        <StaffDashboard />
      )}
    </div>
  );
}
