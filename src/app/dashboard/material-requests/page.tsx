'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { useProjectOptions, UNIT_OPTIONS } from '@/hooks/use-select-options';

const MR_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'rejected', label: 'Rejected' },
];

export default function MaterialRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ projectId: '', neededBy: '', notes: '', items: [{ name: '', qty: 1, unit: 'pcs', estimatedCost: 0 }] });

  const qc = useQueryClient();
  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const { data, isLoading } = useQuery({ queryKey: ['material-requests', statusFilter], queryFn: () => extendedApiClient.getMaterialRequests({ status: statusFilter || undefined }) });
  const create = useMutation({ mutationFn: extendedApiClient.createMaterialRequest, onSuccess: () => { qc.invalidateQueries({ queryKey: ['material-requests'] }); setShowForm(false); } });
  const approve = useMutation({ mutationFn: extendedApiClient.approveMaterialRequest, onSuccess: () => qc.invalidateQueries({ queryKey: ['material-requests'] }) });

  const requests = (data?.data?.data ?? data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Material Requests" subtitle="Site material requisitions"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Request</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select options={projectOptions} value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} placeholder="Select project *" loading={pLoading} label="Project" />
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Needed By</label>
                <input className="input-base" type="date" value={form.neededBy} onChange={e => setForm(p => ({ ...p, neededBy: e.target.value }))} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Items</p>
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                  <input className="input-base col-span-2" placeholder="Material name *" required value={item.name} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, name: e.target.value } : it) }))} />
                  <input className="input-base" type="number" placeholder="Qty" value={item.qty} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, qty: Number(e.target.value) } : it) }))} />
                  <Select options={UNIT_OPTIONS} value={item.unit} onChange={v => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, unit: v } : it) }))} placeholder="Unit" searchable={false} />
                </div>
              ))}
              <button type="button" className="text-xs" style={{ color: 'var(--brand-500)' }} onClick={() => setForm(p => ({ ...p, items: [...p.items, { name: '', qty: 1, unit: 'pcs', estimatedCost: 0 }] }))}>+ Add item</button>
            </div>
            <input className="input-base" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Submitting…' : 'Submit'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="w-48">
        <Select options={MR_STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" searchable={false} />
      </div>

      <DataTable data={requests as any} isLoading={isLoading} emptyIcon={<ShoppingCart size={40} />} emptyText="No material requests."
        columns={[
          { key: 'projectId', label: 'Project', render: (r: any) => {
            const p = projectOptions.find(o => o.value === r.projectId);
            return <span style={{ color: 'var(--text-secondary)' }}>{p?.label ?? r.projectId?.slice(0,8)}</span>;
          }},
          { key: 'items', label: 'Items', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.items?.length ?? 0} item(s)</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'neededBy', label: 'Needed By', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.neededBy ? new Date(r.neededBy).toLocaleDateString() : '—'}</span> },
          { key: 'createdAt', label: 'Requested', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => r.status === 'pending' ? (
            <button onClick={() => approve.mutate(r.id)} className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#16a34a', color: '#16a34a' }}><Check size={12} />Approve</button>
          ) : null },
        ]}
      />
    </div>
  );
}
