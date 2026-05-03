'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV4 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { CheckCircle, Plus } from 'lucide-react';
import { usePOOptions, useGRNOptions, useVendorInvoiceOptions } from '@/hooks/use-select-options';

export default function ThreeWayMatchPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ poId: '', grnId: '', invoiceId: '' });
  const qc = useQueryClient();
  const { options: poOptions, isLoading: poLoading } = usePOOptions();
  const { options: grnOptions, isLoading: grnLoading } = useGRNOptions(form.poId || undefined);
  const { options: invoiceOptions, isLoading: invLoading } = useVendorInvoiceOptions();
  const { data, isLoading } = useQuery({ queryKey: ['3wm'], queryFn: apiV4.getThreeWayMatches });
  const create = useMutation({ mutationFn: apiV4.createThreeWayMatch, onSuccess: () => { qc.invalidateQueries({ queryKey: ['3wm'] }); setShowForm(false); } });
  const matches = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="3-Way Match" subtitle="PO → GRN → Invoice verification"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Create Match</button>} />
      <div className="card p-4" style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)', borderWidth: 1 }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          3-Way Match verifies that the <strong>Purchase Order</strong>, <strong>Goods Receipt Note</strong>, and <strong>Vendor Invoice</strong> all match before approving payment.
        </p>
      </div>
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select options={poOptions} value={form.poId} onChange={v => setForm(p => ({ ...p, poId: v, grnId: '' }))} placeholder="Select PO *" loading={poLoading} label="Purchase Order" />
            <Select options={grnOptions} value={form.grnId} onChange={v => setForm(p => ({ ...p, grnId: v }))} placeholder="Select GRN *" loading={grnLoading} label="GRN" />
            <Select options={invoiceOptions} value={form.invoiceId} onChange={v => setForm(p => ({ ...p, invoiceId: v }))} placeholder="Select Vendor Invoice *" loading={invLoading} label="Vendor Invoice" />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Matching…' : 'Run Match'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={matches} isLoading={isLoading} emptyIcon={<CheckCircle size={40} />} emptyText="No matches created yet."
        columns={[
          { key: 'poId', label: 'PO', render: (r: any) => {
            const po = poOptions.find(o => o.value === r.poId);
            return <span className="font-mono text-xs" style={{ color: 'var(--brand-500)' }}>{po?.label ?? r.poId?.slice(0,8)}</span>;
          }},
          { key: 'poAmount', label: 'PO Amount', render: (r: any) => <span>৳{Number(r.poAmount).toLocaleString()}</span> },
          { key: 'grnAmount', label: 'GRN Amount', render: (r: any) => <span>৳{Number(r.grnAmount).toLocaleString()}</span> },
          { key: 'invoiceAmount', label: 'Invoice Amount', render: (r: any) => <span>৳{Number(r.invoiceAmount).toLocaleString()}</span> },
          { key: 'status', label: 'Match Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'discrepancyNotes', label: 'Notes', render: (r: any) => <span className="text-xs" style={{ color: r.discrepancyNotes ? '#dc2626' : 'var(--text-muted)' }}>{r.discrepancyNotes || '—'}</span> },
        ]}
      />
    </div>
  );
}
