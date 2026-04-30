'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV4 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Shield, Plus } from 'lucide-react';

const PERMISSIONS = [
  'projects:read','projects:write','projects:delete',
  'finance:read','finance:write',
  'hr:read','hr:write',
  'procurement:read','procurement:write',
  'crm:read','crm:write',
  'hse:read','hse:write',
  'documents:read','documents:write',
  'users:read','users:write',
  'reports:read',
];

export default function RolesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', permissions: {} as Record<string, boolean> });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['custom-roles'], queryFn: apiV4.getCustomRoles });
  const create = useMutation({ mutationFn: apiV4.createCustomRole, onSuccess: () => { qc.invalidateQueries({ queryKey: ['custom-roles'] }); setShowForm(false); } });
  const roles = (data?.data as any) ?? [];

  const togglePerm = (perm: string) => setForm(p => ({ ...p, permissions: { ...p.permissions, [perm]: !p.permissions[perm] } }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Custom Roles" subtitle="Define granular permission sets for your team"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Create Role</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input-base" placeholder="Role name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <input className="input-base" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Permissions</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PERMISSIONS.map(perm => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-(--bg-muted) transition-colors">
                    <input type="checkbox" checked={!!form.permissions[perm]} onChange={() => togglePerm(perm)} />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create Role'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={roles} isLoading={isLoading} emptyIcon={<Shield size={40} />} emptyText="No custom roles yet."
        columns={[
          { key: 'name', label: 'Role Name', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'description', label: 'Description', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.description ?? '—'}</span> },
          { key: 'permissions', label: 'Permissions', render: (r: any) => {
            const count = Object.values(r.permissions ?? {}).filter(Boolean).length;
            return <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>{count} permissions</span>;
          }},
          { key: 'isActive', label: 'Status', render: (r: any) => <span className="text-xs" style={{ color: r.isActive ? '#16a34a' : '#6b7280' }}>{r.isActive ? 'Active' : 'Inactive'}</span> },
        ]}
      />
    </div>
  );
}
