'use client';

import { useState } from 'react';
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrder } from '@/hooks/use-procurement';
import { useVendors } from '@/hooks/use-procurement';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ShoppingCart, Plus } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vendorId: '', totalCost: '', expectedDate: '', notes: '' });

  const { data, isLoading } = usePurchaseOrders({ status: statusFilter || undefined });
  const { data: vendorData } = useVendors();
  const create = useCreatePurchaseOrder();
  const vendors = vendorData?.data?.data ?? [];
  const pos = data?.data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ ...form, totalCost: Number(form.totalCost), items: [] } as any);
    setShowForm(false); setForm({ vendorId: '', totalCost: '', expectedDate: '', notes: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Purchase Orders" subtitle="Manage procurement orders"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New PO</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select className="input-base" required value={form.vendorId} onChange={e => setForm(p => ({ ...p, vendorId: e.target.value }))}>
              <option value="">Select vendor *</option>
              {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <input className="input-base" type="number" placeholder="Total cost (BDT) *" required value={form.totalCost} onChange={e => setForm(p => ({ ...p, totalCost: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Expected date" value={form.expectedDate} onChange={e => setForm(p => ({ ...p, expectedDate: e.target.value }))} />
            <input className="input-base" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <select className="input-base w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">All Status</option>
        {['draft','sent','approved','received','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <DataTable data={pos as any} isLoading={isLoading} emptyIcon={<ShoppingCart size={40} />} emptyText="No purchase orders."
        columns={[
          { key: 'poNumber', label: 'PO #', render: (r: any) => <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand-500)' }}>{r.poNumber}</span> },
          { key: 'vendorId', label: 'Vendor', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.vendorId}</span> },
          { key: 'totalCost', label: 'Total Cost', render: (r: any) => <span className="font-semibold">৳{Number(r.totalCost).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'expectedDate', label: 'Expected', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.expectedDate ? new Date(r.expectedDate).toLocaleDateString() : '—'}</span> },
          { key: 'createdAt', label: 'Created', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
        ]}
      />
    </div>
  );
}
