'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { Building2, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useUserOptions } from '@/hooks/use-select-options';

export default function DepartmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', headUserId: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '', headUserId: '' });

  const qc = useQueryClient();
  const { options: userOptions, isLoading: uLoading } = useUserOptions();
  const { data, isLoading } = useQuery({ queryKey: ['departments'], queryFn: extendedApiClient.getDepartments });

  const create = useMutation({
    mutationFn: extendedApiClient.createDepartment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setShowForm(false); setForm({ name: '', description: '', headUserId: '' }); },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => extendedApiClient.updateDepartment(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setEditingId(null); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => extendedApiClient.deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });

  const departments = (data?.data as any) ?? [];

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setEditForm({ name: r.name, description: r.description ?? '', headUserId: r.headUserId ?? '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Departments" subtitle="Organizational structure"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Department</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Department name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="sm:col-span-2">
              <Select options={userOptions} value={form.headUserId} onChange={v => setForm(p => ({ ...p, headUserId: v }))} placeholder="Department head (optional)" loading={uLoading} clearable label="Head" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingId && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Edit Department</h3>
          <form onSubmit={e => { e.preventDefault(); update.mutate({ id: editingId, body: editForm }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Department name *" required value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" placeholder="Description" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
            <div className="sm:col-span-2">
              <Select options={userOptions} value={editForm.headUserId} onChange={v => setEditForm(p => ({ ...p, headUserId: v }))} placeholder="Department head (optional)" loading={uLoading} clearable label="Head" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={update.isPending} className="btn-primary">{update.isPending ? 'Saving…' : 'Update'}</button>
              <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable data={departments} isLoading={isLoading} emptyIcon={<Building2 size={40} />} emptyText="No departments yet."
        columns={[
          { key: 'name', label: 'Department', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'description', label: 'Description', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.description ?? '—'}</span> },
          { key: 'headUserId', label: 'Head', render: (r: any) => {
            const u = userOptions.find(o => o.value === r.headUserId);
            return <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u?.label ?? '—'}</span>;
          }},
          { key: 'createdAt', label: 'Created', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              <button onClick={() => startEdit(r)} className="p-1.5 rounded hover:bg-(--bg-muted)" style={{ color: 'var(--text-muted)' }}><Edit2 size={13} /></button>
              <button onClick={() => remove.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={13} /></button>
            </div>
          )},
        ]}
      />
    </div>
  );
}
