'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Building2, Plus } from 'lucide-react';

export default function DepartmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['departments'], queryFn: extendedApiClient.getDepartments });
  const create = useMutation({ mutationFn: extendedApiClient.createDepartment, onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setShowForm(false); setForm({ name: '', description: '' }); } });

  const departments = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Departments" subtitle="Organizational structure"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Department</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Department name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable data={departments} isLoading={isLoading} emptyIcon={<Building2 size={40} />} emptyText="No departments yet."
        columns={[
          { key: 'name', label: 'Department', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'description', label: 'Description', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.description ?? '—'}</span> },
          { key: 'createdAt', label: 'Created', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
        ]}
      />
    </div>
  );
}
