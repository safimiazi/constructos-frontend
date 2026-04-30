'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { useVendors } from '@/hooks/use-procurement';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { ShoppingCart, Plus } from 'lucide-react';
import { useVendorOptions } from '@/hooks/use-select-options';

export default function RFQPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ notes: '', deadline: '', items: [{ description: '', quantity: 1, unit: 'pcs' }] });
  const qc = useQueryClient();
  const { options: vendorOptions, isLoading: vLoading } = useVendorOptions();
  const { data, isLoading } = useQuery({ queryKey: ['rfqs'], queryFn: apiV2.getRFQs });
  const create = useMutation({ mutationFn: apiV2.createRFQ, onSuccess: () => { qc.invalidateQueries({ queryKey: ['rfqs'] }); setShowForm(false); } });
  const award = useMutation({ mutationFn: ({ id, vendorId }: { id: string; vendorId: string }) => apiV2.awardRFQ(id, vendorId), onSuccess: () => qc.invalidateQueries({ queryKey: ['rfqs'] }) });
  const rfqs = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="RFQs" subtitle="Request for Quotations"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New RFQ</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input-base" type="date" placeholder="Deadline" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
              <input className="input-base" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Items</p>
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  <input className="input-base" placeholder="Description *" required value={item.description} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, description: e.target.value } : it) }))} />
                  <input className="input-base" type="number" placeholder="Qty" value={item.quantity} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, quantity: Number(e.target.value) } : it) }))} />
                  <input className="input-base" placeholder="Unit" value={item.unit} onChange={e => setForm(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, unit: e.target.value } : it) }))} />
                </div>
              ))}
              <button type="button" className="text-xs" style={{ color: 'var(--brand-500)' }} onClick={() => setForm(p => ({ ...p, items: [...p.items, { description: '', quantity: 1, unit: 'pcs' }] }))}>+ Add item</button>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create RFQ'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={rfqs} isLoading={isLoading} emptyIcon={<ShoppingCart size={40} />} emptyText="No RFQs yet."
        columns={[
          { key: 'rfqNumber', label: 'RFQ #', render: (r: any) => <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand-500)' }}>{r.rfqNumber}</span> },
          { key: 'items', label: 'Items', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.items?.length ?? 0} item(s)</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'deadline', label: 'Deadline', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.deadline ? new Date(r.deadline).toLocaleDateString() : '—'}</span> },
          { key: 'actions', label: '', render: (r: any) => r.status !== 'awarded' ? (
            <div className="w-44">
              <Select
                options={[{ value: '', label: 'Award to vendor…' }, ...vendorOptions]}
                value=""
                onChange={v => v && award.mutate({ id: r.id, vendorId: v })}
                placeholder="Award to vendor…"
                loading={vLoading}
              />
            </div>
          ) : null },
        ]}
      />
    </div>
  );
}
