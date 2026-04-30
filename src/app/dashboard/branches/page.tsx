'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Building2, Plus, Trash2, Edit2 } from 'lucide-react';

export default function BranchesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', city: '', phone: '', isHQ: false });
  const [editForm, setEditForm] = useState({ name: '', city: '', phone: '', isHQ: false });

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['branches'], queryFn: apiV2.getBranches });
  const create = useMutation({
    mutationFn: apiV2.createBranch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setShowForm(false); setForm({ name: '', city: '', phone: '', isHQ: false }); },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => apiV2.updateBranch(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setEditingId(null); },
  });
  const remove = useMutation({
    mutationFn: apiV2.deleteBranch,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });

  const branches = (data?.data as any[]) ?? [];

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setEditForm({ name: r.name, city: r.city ?? '', phone: r.phone ?? '', isHQ: r.isHQ });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Branches" subtitle="Manage company offices & branches"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Branch</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input-base" placeholder="Branch name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" placeholder="City *" required value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
            <input className="input-base" placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isHQ} onChange={e => setForm(p => ({ ...p, isHQ: e.target.checked }))} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Headquarters</span>
            </label>
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingId && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Edit Branch</h3>
          <form onSubmit={e => { e.preventDefault(); update.mutate({ id: editingId, body: editForm }); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input-base" placeholder="Branch name *" required value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" placeholder="City" value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} />
            <input className="input-base" placeholder="Phone" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.isHQ} onChange={e => setEditForm(p => ({ ...p, isHQ: e.target.checked }))} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Headquarters</span>
            </label>
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={update.isPending} className="btn-primary">{update.isPending ? 'Saving…' : 'Update'}</button>
              <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable data={branches} isLoading={isLoading} emptyIcon={<Building2 size={40} />} emptyText="No branches yet."
        columns={[
          { key: 'name', label: 'Branch', render: (r: any) => (
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span>
              {r.isHQ && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>HQ</span>}
            </div>
          )},
          { key: 'city', label: 'City', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.city ?? '—'}</span> },
          { key: 'phone', label: 'Phone', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.phone ?? '—'}</span> },
          { key: 'isActive', label: 'Status', render: (r: any) => (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: r.isActive !== false ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: r.isActive !== false ? '#16a34a' : '#6b7280' }}>
              {r.isActive !== false ? 'Active' : 'Inactive'}
            </span>
          )},
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
