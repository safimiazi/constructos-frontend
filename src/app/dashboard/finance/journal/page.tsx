'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { ClipboardList, Plus, Check } from 'lucide-react';

export default function JournalPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    lines: [{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }],
  });
  const qc = useQueryClient();

  const { data: coaData } = useQuery({ queryKey: ['coa'], queryFn: apiV2.getCOA });
  const { data, isLoading } = useQuery({ queryKey: ['journal-entries'], queryFn: () => apiV2.getJournalEntries() });
  const create = useMutation({ mutationFn: apiV2.createJournalEntry, onSuccess: () => { qc.invalidateQueries({ queryKey: ['journal-entries'] }); setShowForm(false); } });
  const post = useMutation({ mutationFn: apiV2.postJournalEntry, onSuccess: () => qc.invalidateQueries({ queryKey: ['journal-entries'] }) });

  const entries = data?.data?.data ?? [];
  const coaOptions = ((coaData?.data as any[]) ?? []).map((a: any) => ({
    value: a.id,
    label: `${a.code} — ${a.name}`,
    description: a.type,
  }));

  const totalDebit = form.lines.reduce((s, l) => s + Number(l.debit), 0);
  const totalCredit = form.lines.reduce((s, l) => s + Number(l.credit), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const updateLine = (i: number, field: string, value: string | number) =>
    setForm(p => ({ ...p, lines: p.lines.map((l, j) => j === i ? { ...l, [field]: value } : l) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Journal Entries" subtitle="Double-entry bookkeeping"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Entry</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); if (!isBalanced) return; create.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date *</label>
                <input className="input-base" type="date" required value={form.entryDate} onChange={e => setForm(p => ({ ...p, entryDate: e.target.value }))} />
              </div>
              <input className="input-base" placeholder="Reference" value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
              <input className="input-base" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Lines</p>
                <span className="text-xs" style={{ color: isBalanced ? '#16a34a' : '#dc2626' }}>
                  Debit ৳{totalDebit.toLocaleString()} / Credit ৳{totalCredit.toLocaleString()}
                  {isBalanced ? ' ✓ Balanced' : ' — Not balanced'}
                </span>
              </div>
              {form.lines.map((line, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <Select
                    options={coaOptions}
                    value={line.accountId}
                    onChange={v => updateLine(i, 'accountId', v)}
                    placeholder="Select account *"
                    label={i === 0 ? 'Account' : undefined}
                  />
                  <div>
                    {i === 0 && <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Debit</label>}
                    <input className="input-base" type="number" min="0" step="0.01" placeholder="Debit" value={line.debit || ''} onChange={e => updateLine(i, 'debit', Number(e.target.value))} />
                  </div>
                  <div>
                    {i === 0 && <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Credit</label>}
                    <input className="input-base" type="number" min="0" step="0.01" placeholder="Credit" value={line.credit || ''} onChange={e => updateLine(i, 'credit', Number(e.target.value))} />
                  </div>
                </div>
              ))}
              <button type="button" className="text-xs mt-1" style={{ color: 'var(--brand-500)' }}
                onClick={() => setForm(p => ({ ...p, lines: [...p.lines, { accountId: '', debit: 0, credit: 0 }] }))}>
                + Add line
              </button>
            </div>

            {!isBalanced && totalDebit > 0 && (
              <p className="text-xs" style={{ color: '#dc2626' }}>Debit and credit totals must be equal before saving.</p>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={create.isPending || !isBalanced} className="btn-primary">
                {create.isPending ? 'Saving…' : 'Save Draft'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable data={entries as any} isLoading={isLoading} emptyIcon={<ClipboardList size={40} />} emptyText="No journal entries."
        columns={[
          { key: 'entryDate', label: 'Date', render: (r: any) => <span>{new Date(r.entryDate).toLocaleDateString()}</span> },
          { key: 'reference', label: 'Reference', render: (r: any) => <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{r.reference ?? '—'}</span> },
          { key: 'description', label: 'Description', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.description ?? '—'}</span> },
          { key: 'lines', label: 'Lines', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.lines?.length ?? 0} lines</span> },
          { key: 'isPosted', label: 'Status', render: (r: any) => (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: r.isPosted ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: r.isPosted ? '#16a34a' : '#d97706' }}>
              {r.isPosted ? 'Posted' : 'Draft'}
            </span>
          )},
          { key: 'actions', label: '', render: (r: any) => !r.isPosted ? (
            <button onClick={() => post.mutate(r.id)} className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#16a34a', color: '#16a34a' }}>
              <Check size={12} />Post
            </button>
          ) : null },
        ]}
      />
    </div>
  );
}

