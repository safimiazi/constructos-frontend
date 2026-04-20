'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Wallet, Plus } from 'lucide-react';

export default function BankAccountsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', accountNo: '', bankName: '', currency: 'BDT', balance: '' });

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['bank-accounts'], queryFn: extendedApiClient.getBankAccounts });
  const create = useMutation({ mutationFn: extendedApiClient.createBankAccount, onSuccess: () => { qc.invalidateQueries({ queryKey: ['bank-accounts'] }); setShowForm(false); } });

  const accounts = (data?.data as any) ?? [];
  const totalBalance = accounts.reduce((s: number, a: any) => s + Number(a.balance), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Bank Accounts" subtitle="Company bank accounts"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Account</button>} />

      {accounts.length > 0 && (
        <div className="card p-5 flex items-center gap-4">
          <Wallet size={24} style={{ color: 'var(--brand-500)' }} />
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Balance (All Accounts)</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>৳{totalBalance.toLocaleString()}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, balance: Number(form.balance) }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Account name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" placeholder="Account number *" required value={form.accountNo} onChange={e => setForm(p => ({ ...p, accountNo: e.target.value }))} />
            <input className="input-base" placeholder="Bank name *" required value={form.bankName} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} />
            <select className="input-base" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
              {['BDT','USD','EUR','GBP'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input-base" type="number" placeholder="Opening balance" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable data={accounts} isLoading={isLoading} emptyIcon={<Wallet size={40} />} emptyText="No bank accounts added."
        columns={[
          { key: 'name', label: 'Account Name', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'bankName', label: 'Bank', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.bankName}</span> },
          { key: 'accountNo', label: 'Account No', render: (r: any) => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{r.accountNo}</span> },
          { key: 'currency', label: 'Currency', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>{r.currency}</span> },
          { key: 'balance', label: 'Balance', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(r.balance).toLocaleString()}</span> },
          { key: 'isActive', label: 'Status', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: r.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: r.isActive ? '#16a34a' : '#6b7280' }}>{r.isActive ? 'Active' : 'Inactive'}</span> },
        ]}
      />
    </div>
  );
}
