'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV5 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { Shield, Plus, X } from 'lucide-react';
import { useProjectOptions } from '@/hooks/use-select-options';

const PTW_TYPE_OPTIONS = [
  { value: 'hot_work', label: 'Hot Work', description: 'Welding, cutting, grinding' },
  { value: 'excavation', label: 'Excavation', description: 'Digging, trenching' },
  { value: 'confined_space', label: 'Confined Space', description: 'Tanks, manholes' },
  { value: 'electrical', label: 'Electrical', description: 'HV/LV electrical work' },
  { value: 'working_at_height', label: 'Working at Height', description: 'Scaffolding, ladders' },
];

const PTW_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function PTWPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ projectId: '', permitType: 'hot_work', issuedTo: '', validFrom: '', validUntil: '', notes: '' });
  const qc = useQueryClient();
  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const { data, isLoading } = useQuery({ queryKey: ['ptw', statusFilter], queryFn: () => apiV5.getPTWs({ status: statusFilter || undefined }) });
  const create = useMutation({ mutationFn: apiV5.createPTW, onSuccess: () => { qc.invalidateQueries({ queryKey: ['ptw'] }); setShowForm(false); } });
  const close = useMutation({ mutationFn: apiV5.closePTW, onSuccess: () => qc.invalidateQueries({ queryKey: ['ptw'] }) });
  const permits = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Permits to Work" subtitle="Digital permit issuance & tracking"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Issue Permit</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select options={projectOptions} value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} placeholder="Select project *" loading={pLoading} label="Project" />
            <Select options={PTW_TYPE_OPTIONS} value={form.permitType} onChange={v => setForm(p => ({ ...p, permitType: v }))} placeholder="Permit type" label="Type" />
            <input className="input-base" placeholder="Issued to (person/company) *" required value={form.issuedTo} onChange={e => setForm(p => ({ ...p, issuedTo: e.target.value }))} />
            <input className="input-base" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Valid From *</label>
              <input className="input-base" type="datetime-local" required value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Valid Until *</label>
              <input className="input-base" type="datetime-local" required value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Issuing…' : 'Issue Permit'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="w-48">
        <Select options={PTW_STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" searchable={false} />
      </div>
      <DataTable data={permits} isLoading={isLoading} emptyIcon={<Shield size={40} />} emptyText="No permits issued."
        columns={[
          { key: 'permitType', label: 'Type', render: (r: any) => {
            const t = PTW_TYPE_OPTIONS.find(o => o.value === r.permitType);
            return <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>{t?.label ?? r.permitType}</span>;
          }},
          { key: 'issuedTo', label: 'Issued To', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.issuedTo}</span> },
          { key: 'validFrom', label: 'Valid From', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.validFrom ? new Date(r.validFrom).toLocaleString() : '—'}</span> },
          { key: 'validUntil', label: 'Valid Until', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.validUntil ? new Date(r.validUntil).toLocaleString() : '—'}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'actions', label: '', render: (r: any) => (r.status === 'active' || r.status === 'pending') ? (
            <button onClick={() => close.mutate(r.id)} className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#6b7280', color: '#6b7280' }}><X size={12} />Close</button>
          ) : null },
        ]}
      />
    </div>
  );
}
