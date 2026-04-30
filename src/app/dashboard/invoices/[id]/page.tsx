'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, DollarSign } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { apiClient, apiV2 } from '@/lib/api';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'mobile_banking', label: 'Mobile Banking' },
];

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'bank_transfer', reference: '', paidAt: new Date().toISOString().split('T')[0], notes: '' });

  const { data: invData, isLoading } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => apiClient.getInvoice(id),
    enabled: !!id,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['invoices', id, 'payments'],
    queryFn: () => apiV2.getInvoicePayments(id),
    enabled: !!id,
  });

  const recordPayment = useMutation({
    mutationFn: (body: typeof payForm) => apiV2.recordInvoicePayment(id, { ...body, amount: Number(body.amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', id] });
      qc.invalidateQueries({ queryKey: ['invoices', id, 'payments'] });
      setShowPayForm(false);
      setPayForm({ amount: '', method: 'bank_transfer', reference: '', paidAt: new Date().toISOString().split('T')[0], notes: '' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => apiClient.updateInvoiceStatus(id, status as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices', id] }),
  });

  const invoice = invData?.data;
  const payments = (paymentsData?.data as any[]) ?? [];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!invoice) return <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Invoice not found.</div>;

  const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/dashboard/invoices" className="flex items-center gap-1.5 text-sm mb-3 hover:underline" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Invoices
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="page-title">{invoice.invoiceNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={invoice.status} />
              <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{invoice.type} invoice</span>
            </div>
          </div>
          <div className="flex gap-2">
            {invoice.status === 'draft' && (
              <button onClick={() => updateStatus.mutate('sent')} className="btn-secondary text-sm">Mark as Sent</button>
            )}
            {invoice.status === 'sent' && outstanding > 0 && (
              <button onClick={() => setShowPayForm(v => !v)} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> Record Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Amount', value: `৳${Number(invoice.totalAmount).toLocaleString()}`, color: 'var(--text-primary)' },
          { label: 'Paid', value: `৳${Number(invoice.paidAmount).toLocaleString()}`, color: '#16a34a' },
          { label: 'Outstanding', value: `৳${outstanding.toLocaleString()}`, color: outstanding > 0 ? '#dc2626' : '#16a34a' },
          { label: 'Due Date', value: new Date(invoice.dueDate).toLocaleDateString(), color: 'var(--text-secondary)' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Invoice details */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Invoice Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Issue Date', value: new Date(invoice.issueDate).toLocaleDateString() },
            { label: 'Due Date', value: new Date(invoice.dueDate).toLocaleDateString() },
            { label: 'Subtotal', value: `৳${Number(invoice.subtotal).toLocaleString()}` },
            { label: 'Tax', value: `৳${Number(invoice.taxAmount).toLocaleString()}` },
            { label: 'Total', value: `৳${Number(invoice.totalAmount).toLocaleString()}` },
            { label: 'Notes', value: invoice.notes || '—' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Line items */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>LINE ITEMS</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Description', 'Qty', 'Unit Price', 'Amount'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{item.description}</td>
                      <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>{item.quantity}</td>
                      <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>৳{Number(item.unitPrice).toLocaleString()}</td>
                      <td className="py-2 font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Record payment form */}
      {showPayForm && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Record Payment</h2>
          <form onSubmit={e => { e.preventDefault(); recordPayment.mutate(payForm); }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" type="number" placeholder={`Amount (max ৳${outstanding.toLocaleString()}) *`}
              required max={outstanding} value={payForm.amount}
              onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} />
            <Select options={PAYMENT_METHOD_OPTIONS} value={payForm.method}
              onChange={v => setPayForm(p => ({ ...p, method: v }))} label="Payment Method" searchable={false} />
            <input className="input-base" placeholder="Reference / Transaction ID"
              value={payForm.reference} onChange={e => setPayForm(p => ({ ...p, reference: e.target.value }))} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Payment Date</label>
              <input className="input-base" type="date" value={payForm.paidAt}
                onChange={e => setPayForm(p => ({ ...p, paidAt: e.target.value }))} />
            </div>
            <input className="input-base sm:col-span-2" placeholder="Notes"
              value={payForm.notes} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={recordPayment.isPending} className="btn-primary">
                {recordPayment.isPending ? 'Recording…' : 'Record Payment'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowPayForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Payment history */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'Amount', 'Method', 'Reference', 'Notes'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(p.paidAt ?? p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: '#16a34a' }}>৳{Number(p.amount).toLocaleString()}</td>
                    <td className="px-5 py-3 text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{p.method?.replace('_', ' ')}</td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{p.reference || '—'}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{p.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
