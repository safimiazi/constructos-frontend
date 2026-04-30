'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { apiV4 } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
];

export default function ProjectSubcontractsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subcontractorName: '', scope: '', contractValue: '', startDate: '', endDate: '', status: 'draft',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['projects', id, 'subcontracts'],
    queryFn: () => apiV4.getSubcontracts(id),
    enabled: !!id,
  });

  const createSub = useMutation({
    mutationFn: (body: typeof form) => apiV4.createSubcontract(id, { ...body, contractValue: Number(body.contractValue) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', id, 'subcontracts'] });
      setShowForm(false);
      setForm({ subcontractorName: '', scope: '', contractValue: '', startDate: '', endDate: '', status: 'draft' });
    },
  });

  const updateSub = useMutation({
    mutationFn: ({ sid, body }: { sid: string; body: Record<string, string> }) => apiV4.updateSubcontract(id, sid, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', id, 'subcontracts'] }),
  });

  const subs = (data?.data as any[]) ?? [];
  const totalValue = subs.reduce((sum: number, s: any) => sum + Number(s.contractValue ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href={`/dashboard/projects/${id}`} className="flex items-center gap-1.5 text-sm mb-3 hover:underline" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="page-title">Subcontracts</h1>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}>
            <Plus size={16} /> Add Subcontract
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Subcontracts', value: subs.length, color: '#6366f1' },
          { label: 'Active', value: subs.filter((s: any) => s.status === 'active').length, color: '#16a34a' },
          { label: 'Draft', value: subs.filter((s: any) => s.status === 'draft').length, color: '#f59e0b' },
          { label: 'Total Value', value: `৳${totalValue.toLocaleString()}`, color: '#9333ea' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>New Subcontract</h3>
          <form onSubmit={e => { e.preventDefault(); createSub.mutate(form); }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Subcontractor name *" required
              value={form.subcontractorName} onChange={e => setForm(p => ({ ...p, subcontractorName: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Contract value (৳) *" required
              value={form.contractValue} onChange={e => setForm(p => ({ ...p, contractValue: e.target.value }))} />
            <Select options={STATUS_OPTIONS} value={form.status}
              onChange={v => setForm(p => ({ ...p, status: v }))} label="Status" searchable={false} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Start Date</label>
              <input className="input-base" type="date" value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>End Date</label>
              <input className="input-base" type="date" value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            <textarea className="input-base sm:col-span-2" rows={2} placeholder="Scope of work"
              value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={createSub.isPending} className="btn-primary">
                {createSub.isPending ? 'Adding…' : 'Add Subcontract'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={subs}
        isLoading={isLoading}
        emptyIcon={<FileText size={36} />}
        emptyText="No subcontracts yet."
        columns={[
          { key: 'subcontractorName', label: 'Subcontractor', render: (r: any) => (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.subcontractorName}</span>
          )},
          { key: 'contractValue', label: 'Value', render: (r: any) => (
            <span className="font-semibold" style={{ color: 'var(--brand-500)' }}>৳{Number(r.contractValue).toLocaleString()}</span>
          )},
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'startDate', label: 'Start', render: (r: any) => (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.startDate ? new Date(r.startDate).toLocaleDateString() : '—'}</span>
          )},
          { key: 'endDate', label: 'End', render: (r: any) => (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.endDate ? new Date(r.endDate).toLocaleDateString() : '—'}</span>
          )},
          { key: 'scope', label: 'Scope', render: (r: any) => (
            <span className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{r.scope || '—'}</span>
          )},
          { key: 'actions', label: '', render: (r: any) => r.status === 'draft' ? (
            <button onClick={() => updateSub.mutate({ sid: r.id, body: { status: 'active' } })}
              className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>
              Activate
            </button>
          ) : null },
        ]}
      />
    </div>
  );
}
