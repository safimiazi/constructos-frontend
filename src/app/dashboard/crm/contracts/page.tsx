'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Plus, PenLine } from 'lucide-react';

export default function ContractsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', value: '', startDate: '', endDate: '', clientId: '' });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['contracts'], queryFn: apiV2.getContracts });
  const create = useMutation({ mutationFn: apiV2.createContract, onSuccess: () => { qc.invalidateQueries({ queryKey: ['contracts'] }); setShowForm(false); } });
  const sign = useMutation({ mutationFn: apiV2.signContract, onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });
  const contracts = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Contracts" subtitle="Client contracts & agreements"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Contract</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, value: Number(form.value) }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Contract title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Contract value (BDT) *" required value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
            <input className="input-base" placeholder="Client ID" value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Start date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            <input className="input-base" type="date" placeholder="End date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={contracts} isLoading={isLoading} emptyIcon={<FileText size={40} />} emptyText="No contracts yet."
        columns={[
          { key: 'title', label: 'Contract', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span> },
          { key: 'value', label: 'Value', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(r.value).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'startDate', label: 'Start', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.startDate ? new Date(r.startDate).toLocaleDateString() : '—'}</span> },
          { key: 'endDate', label: 'End', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.endDate ? new Date(r.endDate).toLocaleDateString() : '—'}</span> },
          { key: 'eSignedAt', label: 'Signed', render: (r: any) => <span className="text-xs" style={{ color: r.eSignedAt ? '#16a34a' : 'var(--text-muted)' }}>{r.eSignedAt ? new Date(r.eSignedAt).toLocaleDateString() : 'Not signed'}</span> },
          { key: 'actions', label: '', render: (r: any) => !r.eSignedAt ? (
            <button onClick={() => sign.mutate(r.id)} className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#9333ea', color: '#9333ea' }}><PenLine size={12} />Sign</button>
          ) : null },
        ]}
      />
    </div>
  );
}
