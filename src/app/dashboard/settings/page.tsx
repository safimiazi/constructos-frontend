'use client';

import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/ui/page-header';
import { Settings, User, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} style={{ color: 'var(--brand-500)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Full Name</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Role</p>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-0.5" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>
                {user?.role?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} style={{ color: 'var(--brand-500)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Security</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Password</p>
              <button className="btn-secondary text-xs py-1.5 px-3">Change Password</button>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Two-Factor Auth</p>
              <button className="btn-secondary text-xs py-1.5 px-3">Enable 2FA</button>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} style={{ color: 'var(--brand-500)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
          </div>
          <div className="space-y-3">
            {['Email notifications', 'In-app alerts', 'Project updates', 'Payroll reminders'].map(item => (
              <label key={item} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                <div className="w-9 h-5 rounded-full relative" style={{ background: 'var(--brand-500)' }}>
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} style={{ color: 'var(--brand-500)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>System Info</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Platform', value: 'ConstructOS' },
            { label: 'Version', value: 'v1.0.0' },
            { label: 'Tenant ID', value: user?.tenantId ? user.tenantId.slice(0, 8) + '…' : 'SuperAdmin' },
            { label: 'User ID', value: user?.id ? user.id.slice(0, 8) + '…' : '—' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-sm font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
