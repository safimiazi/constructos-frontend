'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { Package, Plus } from 'lucide-react';
import { usePOOptions } from '@/hooks/use-select-options';

const GRN_STATUS_OPTIONS = [
  { value: 'complete', label: 'Complete' },
  { value: 'partial', label: 'Partial' },
];

export default function GRNPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ poId: '', status: 'complete', notes: '', items: [{ description: '', qtyOrdered: 0, qtyReceived: 0, qtyAccepted: 0 }] });
  const qc = useQueryClient();
  const { options: poOptions, isLoading: poLoading } = usePOOptions();
  const { data, isLoading } = useQuery({ queryKey: ['grns'], queryFn: () => apiV2.getGRNs() });
  const create = useMutation({ mutationFn: apiV2.createGRN, onSuccess: () => { qc.invalidateQueries({ queryKey: ['grns'] }); setShowForm(false); } });
  const grns = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Goods Receipt Notes" subtitle="Record received goods against POs"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New GRN</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, receivedAt: new Date().toISOString() }); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select options={poOptions} value={form.poId} onChange={v => setForm(p => ({ ...p, poId: v }))} placeholder="Select PO *" loading={poLoading} label="Purchase Order" />
              <Select options={GRN_STATUS_OPTIONS} value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} placeholder="Status" label="Status" searchable={false} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Items Received</p>
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                  <input className="input-base" placeholder="Description *" required value={item.description} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, description: e.target.value } : it) }))} />
                  <input className="input-base" type="number" placeholder="Ordered" value={item.qtyOrdered || ''} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, qtyOrdered: Number(e.target.value) } : it) }))} />
                  <input className="input-base" type="number" placeholder="Received" value={item.qtyReceived || ''} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, qtyReceived: Number(e.target.value) } : it) }))} />
                  <input className="input-base" type="number" placeholder="Accepted" value={item.qtyAccepted || ''} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, qtyAccepted: Number(e.target.value) } : it) }))} />
                </div>
              ))}
              <button type="button" className="text-xs" style={{ color: 'var(--brand-500)' }} onClick={() => setForm(p => ({ ...p, items: [...p.items, { description: '', qtyOrdered: 0, qtyReceived: 0, qtyAccepted: 0 }] }))}>+ Add item</button>
            </div>
            <input className="input-base" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save GRN'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={grns} isLoading={isLoading} emptyIcon={<Package size={40} />} emptyText="No GRNs recorded."
        columns={[
          { key: 'poId', label: 'PO', render: (r: any) => {
            const po = poOptions.find(o => o.value === r.poId);
            return <span className="font-mono text-xs" style={{ color: 'var(--brand-500)' }}>{po?.label ?? r.poId?.slice(0,8)}</span>;
          }},
          { key: 'status', label: 'Status', render: (r: any) => <span className="capitalize text-xs px-2 py-0.5 rounded-full" style={{ background: r.status === 'complete' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: r.status === 'complete' ? '#16a34a' : '#d97706' }}>{r.status}</span> },
          { key: 'items', label: 'Items', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.items?.length ?? 0} item(s)</span> },
          { key: 'receivedAt', label: 'Received', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.receivedAt ? new Date(r.receivedAt).toLocaleDateString() : '—'}</span> },
        ]}
      />
    </div>
  );
}
