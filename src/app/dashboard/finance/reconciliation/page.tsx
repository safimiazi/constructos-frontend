'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV4, extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { RefreshCw, Plus, Check } from 'lucide-react';
import { useBankAccountOptions } from '@/hooks/use-select-options';

const TX_TYPE_OPTIONS = [
  { value: 'credit', label: 'Credit (Money In)' },
  { value: 'debit', label: 'Debit (Money Out)' },
];

export default function ReconciliationPage() {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', type: 'credit', date: new Date().toISOString().split('T')[0], reference: '' });
  const qc = useQueryClient();

  const { options: accountOptions, isLoading: aLoading } = useBankAccountOptions();
  const { data: txData, isLoading } = useQuery({ queryKey: ['bank-tx', selectedAccount], queryFn: () => apiV4.getBankTransactions(selectedAccount), enabled: !!selectedAccount });
  const { data: summaryData } = useQuery({ queryKey: ['recon-summary', selectedAccount], queryFn: () => apiV4.getReconciliationSummary(selectedAccount), enabled: !!selectedAccount });
  const createTx = useMutation({ mutationFn: (body: any) => apiV4.createBankTransaction(selectedAccount, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['bank-tx'] }); setShowForm(false); } });
  const reconcile = useMutation({ mutationFn: (txId: string) => apiV4.reconcileTransaction(selectedAccount, txId), onSuccess: () => qc.invalidateQueries({ queryKey: ['bank-tx'] }) });

  const transactions = (txData?.data as any) ?? [];
  const summary = summaryData?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Bank Reconciliation" subtitle="Match bank transactions with system records"
        action={selectedAccount && <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Transaction</button>} />

      <div className="w-72">
        <Select options={accountOptions} value={selectedAccount} onChange={setSelectedAccount} placeholder="Select bank account…" loading={aLoading} label="Bank Account" />
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Credits', value: `৳${Number(summary.totalCredits ?? 0).toLocaleString()}`, color: '#16a34a' },
            { label: 'Total Debits', value: `৳${Number(summary.totalDebits ?? 0).toLocaleString()}`, color: '#dc2626' },
            { label: 'Unreconciled', value: String(summary.unreconciled ?? 0), color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && selectedAccount && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); createTx.mutate({ ...form, amount: Number(form.amount) }); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Description *" required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Amount *" required value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <Select options={TX_TYPE_OPTIONS} value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} placeholder="Type" label="Type" searchable={false} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date</label>
              <input className="input-base" type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <input className="input-base" placeholder="Reference" value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={createTx.isPending} className="btn-primary">{createTx.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selectedAccount && (
        <DataTable data={transactions} isLoading={isLoading} emptyIcon={<RefreshCw size={40} />} emptyText="No transactions found."
          columns={[
            { key: 'date', label: 'Date', render: (r: any) => <span>{new Date(r.date).toLocaleDateString()}</span> },
            { key: 'description', label: 'Description', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.description}</span> },
            { key: 'type', label: 'Type', render: (r: any) => <span className="capitalize text-xs px-2 py-0.5 rounded-full" style={{ background: r.type === 'credit' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: r.type === 'credit' ? '#16a34a' : '#dc2626' }}>{r.type}</span> },
            { key: 'amount', label: 'Amount', render: (r: any) => <span className="font-semibold" style={{ color: r.type === 'credit' ? '#16a34a' : '#dc2626' }}>{r.type === 'debit' ? '-' : '+'}৳{Number(r.amount).toLocaleString()}</span> },
            { key: 'reference', label: 'Reference', render: (r: any) => <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{r.reference ?? '—'}</span> },
            { key: 'reconciled', label: 'Status', render: (r: any) => <span className="text-xs" style={{ color: r.reconciled ? '#16a34a' : '#f59e0b' }}>{r.reconciled ? '✓ Reconciled' : 'Pending'}</span> },
            { key: 'actions', label: '', render: (r: any) => !r.reconciled ? (
              <button onClick={() => reconcile.mutate(r.id)} className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#16a34a', color: '#16a34a' }}><Check size={12} />Reconcile</button>
            ) : null },
          ]}
        />
      )}
    </div>
  );
}
