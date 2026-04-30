'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { TrendingUp, Plus } from 'lucide-react';

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'ASSET', label: 'Asset', description: 'Cash, receivables, equipment' },
  { value: 'LIABILITY', label: 'Liability', description: 'Payables, loans' },
  { value: 'EQUITY', label: 'Equity', description: 'Owner equity, retained earnings' },
  { value: 'INCOME', label: 'Income', description: 'Revenue, sales' },
  { value: 'EXPENSE', label: 'Expense', description: 'Costs, overheads' },
];

export default function COAPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', type: 'ASSET' });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['coa'], queryFn: apiV2.getCOA });
  const create = useMutation({ mutationFn: apiV2.createCOA, onSuccess: () => { qc.invalidateQueries({ queryKey: ['coa'] }); setShowForm(false); setForm({ code: '', name: '', type: 'ASSET' }); } });
  const accounts = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Chart of Accounts" subtitle="General Ledger account structure"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Account</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input-base" placeholder="Code (e.g. 1001) *" required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            <input className="input-base" placeholder="Account name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <Select options={ACCOUNT_TYPE_OPTIONS} value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} placeholder="Account type" label="Type" searchable={false} />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={accounts} isLoading={isLoading} emptyIcon={<TrendingUp size={40} />} emptyText="No accounts yet."
        columns={[
          { key: 'code', label: 'Code', render: (r: any) => <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand-500)' }}>{r.code}</span> },
          { key: 'name', label: 'Account Name', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'type', label: 'Type', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>{r.type}</span> },
          { key: 'isActive', label: 'Status', render: (r: any) => <span className="text-xs" style={{ color: r.isActive ? '#16a34a' : '#6b7280' }}>{r.isActive ? 'Active' : 'Inactive'}</span> },
        ]}
      />
    </div>
  );
}
