'use client';

import { useState } from 'react';
import { useInvoices, useCreateInvoice, useUpdateInvoiceStatus, useDeleteInvoice, useInvoiceStats } from '@/hooks/use-finance';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { TrendingUp, Plus, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { STATUS_OPTIONS, useProjectOptions, useClientOptions } from '@/hooks/use-select-options';
import type { Invoice } from '@/lib/api';

const INVOICE_TYPE_OPTIONS = [
  { value: 'client', label: 'Client Invoice' },
  { value: 'vendor', label: 'Vendor Invoice' },
];

const BLANK = { type: 'client' as const, issueDate: '', dueDate: '', subtotal: '', taxAmount: '0', totalAmount: '', notes: '', projectId: '', clientId: '' };

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  const { data, isLoading } = useInvoices({ status: statusFilter || undefined, type: typeFilter || undefined });
  const { data: statsData } = useInvoiceStats();
  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const { options: clientOptions, isLoading: cLoading } = useClientOptions();
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
            <Select options={INVOICE_TYPE_OPTIONS} value={form.type} onChange={v => setForm(p => ({ ...p, type: v as any }))} placeholder="Invoice type" label="Type" searchable={false} />
            <Select options={projectOptions} value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} placeholder="Link to project" loading={pLoading} clearable label="Project" />
            {form.type === 'client' && (
              <Select options={clientOptions} value={form.clientId} onChange={v => setForm(p => ({ ...p, clientId: v }))} placeholder="Select client" loading={cLoading} clearable label="Client" />
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Issue Date *</label>
              <input className="input-base" type="date" required value={form.issueDate} onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Due Date *</label>
              <input className="input-base" type="date" required value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <input className="input-base" type="number" placeholder="Subtotal (BDT) *" required value={form.subtotal} onChange={e => setForm(p => ({ ...p, subtotal: e.target.value, totalAmount: String(Number(e.target.value) + Number(p.taxAmount)) }))} />
            <input className="input-base" type="number" placeholder="Tax amount" value={form.taxAmount} onChange={e => setForm(p => ({ ...p, taxAmount: e.target.value, totalAmount: String(Number(p.subtotal) + Number(e.target.value)) }))} />
            <input className="input-base" type="number" placeholder="Total amount *" required value={form.totalAmount} onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))} />
            <input className="input-base" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <Select options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS.invoice]} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" searchable={false} />
        </div>
        <div className="w-48">
          <Select options={[{ value: '', label: 'All Types' }, ...INVOICE_TYPE_OPTIONS]} value={typeFilter} onChange={setTypeFilter} placeholder="All Types" searchable={false} />
        </div>
      </div>

      <DataTable data={invoices as any} isLoading={isLoading} emptyIcon={<TrendingUp size={40} />} emptyText="No invoices found."
        columns={[
          { key: 'invoiceNumber', label: 'Invoice #', render: (r: any) => <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand-500)' }}>{r.invoiceNumber}</span> },
          { key: 'type', label: 'Type', render: (r: any) => <span className="capitalize text-xs" style={{ color: 'var(--text-secondary)' }}>{r.type}</span> },
          { key: 'totalAmount', label: 'Amount', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(r.totalAmount).toLocaleString()}</span> },
          { key: 'paidAmount', label: 'Paid', render: (r: any) => <span style={{ color: '#16a34a' }}>৳{Number(r.paidAmount).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'dueDate', label: 'Due', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.dueDate).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              <Link href={`/dashboard/invoices/${r.id}`} className="p-1.5 rounded hover:bg-(--bg-muted) transition-colors" style={{ color: 'var(--text-muted)' }}><Eye size={14} /></Link>
              {r.status === 'draft' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'sent' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#2563eb', color: '#2563eb' }}>Send</button>}
              {r.status === 'sent' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'paid' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Mark Paid</button>}
              <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
            </div>
          )},
        ]}
      />
    </div>
  );
}
