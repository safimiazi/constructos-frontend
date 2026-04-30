'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Plus } from 'lucide-react';

export default function ProposalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', totalValue: '', validUntil: '', notes: '' });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['proposals'], queryFn: apiV2.getProposals });
  const create = useMutation({ mutationFn: apiV2.createProposal, onSuccess: () => { qc.invalidateQueries({ queryKey: ['proposals'] }); setShowForm(false); } });
  const updateStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => apiV2.updateProposalStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals'] }) });
  const proposals = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Proposals" subtitle="Client proposals & quotes"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Proposal</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, totalValue: Number(form.totalValue), items: [] }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Proposal title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Total value (BDT)" value={form.totalValue} onChange={e => setForm(p => ({ ...p, totalValue: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Valid until" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} />
            <textarea className="input-base sm:col-span-2" rows={2} placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={proposals} isLoading={isLoading} emptyIcon={<FileText size={40} />} emptyText="No proposals yet."
        columns={[
          { key: 'title', label: 'Title', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span> },
          { key: 'totalValue', label: 'Value', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(r.totalValue).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'validUntil', label: 'Valid Until', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.validUntil ? new Date(r.validUntil).toLocaleDateString() : '—'}</span> },
          { key: 'actions', label: '', render: (r: any) => r.status === 'draft' ? (
            <div className="flex gap-1">
              <button onClick={() => updateStatus.mutate({ id: r.id, status: 'sent' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#2563eb', color: '#2563eb' }}>Send</button>
              <button onClick={() => updateStatus.mutate({ id: r.id, status: 'accepted' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Accept</button>
            </div>
          ) : null },
        ]}
      />
    </div>
  );
}
