'use client';

import { useState } from 'react';
import { useUsers, useInviteUser, useDeleteUser } from '@/hooks/use-users';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Plus, Search, Trash2 } from 'lucide-react';
import type { UserRole } from '@/lib/api';

const ROLES: UserRole[] = ['OWNER','ADMIN','PROJECT_MANAGER','FINANCE_MANAGER','HR_MANAGER','PROCUREMENT_OFFICER','SITE_ENGINEER','SALES_MANAGER','ACCOUNTANT'];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', role: 'SITE_ENGINEER' as UserRole, password: '' });

  const { data, isLoading } = useUsers({ search: search || undefined });
  const invite = useInviteUser();
  const del = useDeleteUser();
  const users = data?.data?.data ?? [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    await invite.mutateAsync(form);
    setShowForm(false); setForm({ email: '', firstName: '', lastName: '', role: 'SITE_ENGINEER', password: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Users" subtitle="Manage team members & roles"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Invite User</button>} />

      {showForm && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Invite Team Member</h2>
          <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="First name *" required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
            <input className="input-base" placeholder="Last name *" required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
            <input className="input-base" type="email" placeholder="Email *" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input className="input-base" type="password" placeholder="Password *" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            <select className="input-base sm:col-span-2" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={invite.isPending} className="btn-primary">{invite.isPending ? 'Inviting…' : 'Invite'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-base pl-9" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <DataTable data={users as any} isLoading={isLoading} emptyIcon={<Users size={40} />} emptyText="No users found."
        columns={[
          { key: 'name', label: 'User', render: (r: any) => (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br from-purple-600 to-purple-800">
                {((r.firstName?.[0] ?? '') + (r.lastName?.[0] ?? '')).toUpperCase() || r.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.firstName} {r.lastName}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.email}</p>
              </div>
            </div>
          )},
          { key: 'role', label: 'Role', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>{r.role?.replace(/_/g,' ')}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status ?? 'active'} /> },
          { key: 'createdAt', label: 'Joined', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
          )},
        ]}
      />
    </div>
  );
}
