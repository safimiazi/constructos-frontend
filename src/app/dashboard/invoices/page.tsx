'use client';

import { useState } from 'react';
import { useInvoices, useCreateInvoice, useUpdateInvoiceStatus, useDeleteInvoice, useInvoiceStats } from '@/hooks/use-finance';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';
import type { Invoice } from '@/lib/api';

const BLANK = { type: 'client' as const, issueDate: '', dueDate: '', subtotal: '', taxAmount: '0', totalAmount: '', notes: '' };

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  const { data, isLoading } = useInvoices({ status: statusFilter || undefined });
  const { data: statsData } = useInvoiceStats();
  const create = useCreateInvoice();
  const updateStatus = useUpdateInvoiceStatus();
  const del = useDeleteInvoice();

  const invoices: Invoice[] = data?.data?.data ?? [];
  const stats = statsData?.data;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ ...form, subtotal: Number(form.subtotal), taxAmount: Number(form.taxAmount), totalAmount: Number(form.totalAmount), items: [] } as any);
    setShowForm(false); setForm(BLANK);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Invoices" subtitle="Manage client & vendor invoices"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Invoice</button>} />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Invoiced', value: `৳${Number(stats.totalInvoiced).toLocaleString()}`, color: 'var(--brand-500)' },
            { label: 'Total Paid', value: `৳${Number(stats.totalPaid).toLocaleString()}`, color: '#16a34a' },
            { label: 'Overdue', value: String(stats.overdueCount), color: '#dc2626' },
            { label: 'Draft', value: String(stats.draftCount), color: '#6b7280' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Create Invoice</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select className="input-base" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}>
              <option value="client">Client Invoice</option>
              <option value="vendor">Vendor Invoice</option>
            </select>
            <input className="input-base" type="date" placeholder="Issue date *" required value={form.issueDate} onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Due date *" required value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Subtotal (BDT) *" required value={form.subtotal} onChange={e => setForm(p => ({ ...p, subtotal: e.target.value, totalAmount: String(Number(e.target.value) + Number(p.taxAmount)) }))} />
            <input className="input-base" type="number" placeholder="Tax amount" value={form.taxAmount} onChange={e => setForm(p => ({ ...p, taxAmount: e.target.value, totalAmount: String(Number(p.subtotal) + Number(e.target.value)) }))} />
            <input className="input-base" type="number" placeholder="Total amount *" required value={form.totalAmount} onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))} />
            <input className="input-base sm:col-span-2" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <select className="input-base w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">All Status</option>
        {['draft','sent','paid','overdue','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <DataTable data={invoices as any} isLoading={isLoading} emptyIcon={<TrendingUp size={40} />} emptyText="No invoices found."
        columns={[
          { key: 'invoiceNumber', label: 'Invoice #', render: (r: any) => <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand-500)' }}>{r.invoiceNumber}</span> },
          { key: 'type', label: 'Type', render: (r: any) => <span className="capitalize text-xs" style={{ color: 'var(--text-secondary)' }}>{r.type}</span> },
          { key: 'totalAmount', label: 'Amount', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(r.totalAmount).toLocaleString()}</span> },
          { key: 'paidAmount', label: 'Paid', render: (r: any) => <span style={{ color: '#16a34a' }}>৳{Number(r.paidAmount).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'issueDate', label: 'Issued', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.issueDate).toLocaleDateString()}</span> },
          { key: 'dueDate', label: 'Due', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.dueDate).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              {r.status === 'draft' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'sent' })} className="text-xs px-2 py-1 rounded border transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Send</button>}
              {r.status === 'sent' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'paid' })} className="text-xs px-2 py-1 rounded border transition-colors" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Mark Paid</button>}
              <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
            </div>
          )},
        ]}
      />
    </div>
  );
}
