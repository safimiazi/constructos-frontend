'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/ui/page-header';
import { Settings, User, Shield, Bell, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const changePw = useMutation({
    mutationFn: () => apiClient.changePassword(pwForm.currentPassword, pwForm.newPassword),
    onSuccess: () => {
      setPwSuccess(true);
      setPwError('');
      setShowPwForm(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    },
    onError: (err: any) => {
      setPwError(err?.message ?? 'Failed to change password');
    },
  });

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters');
      return;
    }
    changePw.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile */}
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

        {/* Security */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} style={{ color: 'var(--brand-500)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Security</h2>
          </div>
          <div className="space-y-3">
            {pwSuccess && (
              <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <CheckCircle size={14} /> Password changed successfully
              </div>
            )}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Password</p>
              {!showPwForm ? (
                <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => setShowPwForm(true)}>
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePwSubmit} className="space-y-2">
                  <input
                    className="input-base text-xs"
                    type="password"
                    placeholder="Current password"
                    required
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  />
                  <input
                    className="input-base text-xs"
                    type="password"
                    placeholder="New password (min 8 chars)"
                    required
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  />
                  <input
                    className="input-base text-xs"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                  {pwError && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#dc2626' }}>
                      <XCircle size={12} /> {pwError}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button type="submit" disabled={changePw.isPending} className="btn-primary text-xs py-1.5 px-3">
                      {changePw.isPending ? 'Saving…' : 'Update'}
                    </button>
                    <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={() => { setShowPwForm(false); setPwError(''); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Two-Factor Auth</p>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
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
