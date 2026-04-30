'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV4 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { DollarSign, Plus, Check, X } from 'lucide-react';
import { useProjectOptions } from '@/hooks/use-select-options';

const CATEGORY_OPTIONS = [
  { value: 'travel', label: 'Travel' },
  { value: 'meals', label: 'Meals' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'tools', label: 'Tools & Equipment' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paid', label: 'Paid' },
];

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'travel', notes: '', projectId: '' });
  const qc = useQueryClient();
  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const { data, isLoading } = useQuery({ queryKey: ['expenses', statusFilter], queryFn: () => apiV4.getExpenses({ status: statusFilter || undefined }) });
  const create = useMutation({ mutationFn: apiV4.createExpense, onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setShowForm(false); } });
  const approve = useMutation({ mutationFn: apiV4.approveExpense, onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });
  const reject = useMutation({ mutationFn: apiV4.rejectExpense, onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });
  const expenses = data?.data?.data ?? [];
  const totalPending = expenses.filter((e: any) => e.status === 'pending').reduce((s: number, e: any) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Expense Claims" subtitle="Employee expense reimbursements"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Submit Claim</button>} />
      {totalPending > 0 && (
        <div className="card p-4 flex items-center gap-3" style={{ borderColor: '#f59e0b', borderWidth: 1 }}>
          <DollarSign size={18} style={{ color: '#f59e0b' }} />
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Pending approval: <strong style={{ color: '#f59e0b' }}>৳{totalPending.toLocaleString()}</strong></p>
        </div>
      )}
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, amount: Number(form.amount) }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Amount (BDT) *" required value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <input className="input-base" type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            <Select options={CATEGORY_OPTIONS} value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} placeholder="Category" label="Category" searchable={false} />
            <Select options={projectOptions} value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} placeholder="Link to project (optional)" loading={pLoading} clearable label="Project" />
            <input className="input-base sm:col-span-2" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Submitting…' : 'Submit'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="w-48">
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" searchable={false} />
      </div>
      <DataTable data={expenses as any} isLoading={isLoading} emptyIcon={<DollarSign size={40} />} emptyText="No expense claims."
        columns={[
          { key: 'title', label: 'Title', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span> },
          { key: 'category', label: 'Category', render: (r: any) => <span className="capitalize text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>{r.category}</span> },
          { key: 'amount', label: 'Amount', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(r.amount).toLocaleString()}</span> },
          { key: 'date', label: 'Date', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.date).toLocaleDateString()}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'actions', label: '', render: (r: any) => r.status === 'pending' ? (
            <div className="flex gap-1">
              <button onClick={() => approve.mutate(r.id)} className="p-1.5 rounded hover:bg-green-50" style={{ color: '#16a34a' }}><Check size={14} /></button>
              <button onClick={() => reject.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><X size={14} /></button>
            </div>
          ) : null },
        ]}
      />
    </div>
  );
}
