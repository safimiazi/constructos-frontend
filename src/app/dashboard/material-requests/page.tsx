'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { useProjects } from '@/hooks/use-projects';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ShoppingCart, Plus, Check } from 'lucide-react';

export default function MaterialRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ projectId: '', neededBy: '', notes: '', items: [{ name: '', qty: 1, unit: 'pcs', estimatedCost: 0 }] });

  const qc = useQueryClient();
  const { data: projectsData } = useProjects();
  const { data, isLoading } = useQuery({ queryKey: ['material-requests', statusFilter], queryFn: () => extendedApiClient.getMaterialRequests({ status: statusFilter || undefined }) });
  const create = useMutation({ mutationFn: extendedApiClient.createMaterialRequest, onSuccess: () => { qc.invalidateQueries({ queryKey: ['material-requests'] }); setShowForm(false); } });
  const approve = useMutation({ mutationFn: extendedApiClient.approveMaterialRequest, onSuccess: () => qc.invalidateQueries({ queryKey: ['material-requests'] }) });

  const requests = data?.data?.data ?? [];
  const projects = projectsData?.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Material Requests" subtitle="Site material requisitions"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Request</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className="input-base" required value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))}>
                <option value="">Select project *</option>
                {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input className="input-base" type="date" placeholder="Needed by" value={form.neededBy} onChange={e => setForm(p => ({ ...p, neededBy: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Items</p>
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-4 gap-2">
                  <input className="input-base col-span-2" placeholder="Material name *" required value={item.name} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, name: e.target.value } : it) }))} />
                  <input className="input-base" type="number" placeholder="Qty" value={item.qty} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, qty: Number(e.target.value) } : it) }))} />
                  <input className="input-base" placeholder="Unit" value={item.unit} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, unit: e.target.value } : it) }))} />
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

      <select className="input-base w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">All Status</option>
        {['pending','approved','ordered','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <DataTable data={requests as any} isLoading={isLoading} emptyIcon={<ShoppingCart size={40} />} emptyText="No material requests."
        columns={[
          { key: 'projectId', label: 'Project', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.projectId}</span> },
          { key: 'items', label: 'Items', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.items?.length ?? 0} item(s)</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'neededBy', label: 'Needed By', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.neededBy ? new Date(r.neededBy).toLocaleDateString() : '—'}</span> },
          { key: 'createdAt', label: 'Requested', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => r.status === 'pending' ? (
            <button onClick={() => approve.mutate(r.id)} className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#16a34a', color: '#16a34a' }}>
              <Check size={12} /> Approve
            </button>
          ) : null },
        ]}
      />
    </div>
  );
}
