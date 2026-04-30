'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, ShieldAlert } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { apiV4 } from '@/lib/api';

const LIKELIHOOD_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const IMPACT_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'mitigated', label: 'Mitigated' },
  { value: 'closed', label: 'Closed' },
];

export default function ProjectRisksPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', likelihood: 'medium', impact: 'medium', mitigation: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['projects', id, 'risks'],
    queryFn: () => apiV4.getRisks(id),
    enabled: !!id,
  });

  const createRisk = useMutation({
    mutationFn: (body: typeof form) => apiV4.createRisk(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', id, 'risks'] });
      setShowForm(false);
      setForm({ title: '', description: '', likelihood: 'medium', impact: 'medium', mitigation: '' });
    },
  });

  const updateRisk = useMutation({
    mutationFn: ({ rid, body }: { rid: string; body: Record<string, string> }) => apiV4.updateRisk(id, rid, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', id, 'risks'] }),
  });

  const risks = (data?.data as any[]) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href={`/dashboard/projects/${id}`} className="flex items-center gap-1.5 text-sm mb-3 hover:underline" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="page-title">Risk Register</h1>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}>
            <Plus size={16} /> Add Risk
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Risks', value: risks.length, color: '#6366f1' },
          { label: 'Open', value: risks.filter((r: any) => r.status === 'open').length, color: '#ef4444' },
          { label: 'Mitigated', value: risks.filter((r: any) => r.status === 'mitigated').length, color: '#f59e0b' },
          { label: 'Closed', value: risks.filter((r: any) => r.status === 'closed').length, color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>New Risk</h3>
          <form onSubmit={e => { e.preventDefault(); createRisk.mutate(form); }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Risk title *" required
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <Select options={LIKELIHOOD_OPTIONS} value={form.likelihood}
              onChange={v => setForm(p => ({ ...p, likelihood: v }))} label="Likelihood" searchable={false} />
            <Select options={IMPACT_OPTIONS} value={form.impact}
              onChange={v => setForm(p => ({ ...p, impact: v }))} label="Impact" searchable={false} />
            <textarea className="input-base sm:col-span-2" rows={2} placeholder="Description"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <textarea className="input-base sm:col-span-2" rows={2} placeholder="Mitigation plan"
              value={form.mitigation} onChange={e => setForm(p => ({ ...p, mitigation: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={createRisk.isPending} className="btn-primary">
                {createRisk.isPending ? 'Adding…' : 'Add Risk'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={risks}
        isLoading={isLoading}
        emptyIcon={<ShieldAlert size={36} />}
        emptyText="No risks recorded."
        columns={[
          { key: 'title', label: 'Risk', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span> },
          { key: 'likelihood', label: 'Likelihood', render: (r: any) => <StatusBadge status={r.likelihood} /> },
          { key: 'impact', label: 'Impact', render: (r: any) => <StatusBadge status={r.impact} /> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status ?? 'open'} /> },
          { key: 'mitigation', label: 'Mitigation', render: (r: any) => (
            <span className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{r.mitigation || '—'}</span>
          )},
          { key: 'actions', label: '', render: (r: any) => r.status !== 'closed' ? (
            <div className="flex gap-1">
              {r.status === 'open' && (
                <button onClick={() => updateRisk.mutate({ rid: r.id, body: { status: 'mitigated' } })}
                  className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                  Mitigate
                </button>
              )}
              <button onClick={() => updateRisk.mutate({ rid: r.id, body: { status: 'closed' } })}
                className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>
                Close
              </button>
            </div>
          ) : null },
        ]}
      />
    </div>
  );
}
