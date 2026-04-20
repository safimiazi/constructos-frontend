'use client';

import Link from 'next/link';
import { ClipboardList, CalendarDays, FolderKanban, Bell } from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { SectionHeader } from './shared/section-header';

export function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="My Tasks"       value="—" change="Assigned to me"  up icon={ClipboardList} color="purple" />
        <StatCard label="Attendance"     value="—" change="This month"      up icon={CalendarDays}  color="green"  />
        <StatCard label="Leave Balance"  value="—" change="Days remaining"  up icon={CalendarDays}  color="blue"   />
        <StatCard label="Notifications"  value="—" change="Unread"          up={false} icon={Bell}  color="orange" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="My Projects" subtitle="Assigned to me" />
          <Link href="/dashboard/projects" className="text-xs hover:underline" style={{ color: 'var(--brand-500)' }}>
            View all →
          </Link>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No projects assigned yet. Contact your project manager.
        </p>
      </div>
    </div>
  );
}
