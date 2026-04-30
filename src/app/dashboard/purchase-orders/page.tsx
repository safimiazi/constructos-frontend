'use client';

import { useState } from 'react';
import { usePurchaseOrders, useCreatePurchaseOrder, useDeletePurchaseOrder } from '@/hooks/use-procurement';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { STATUS_OPTIONS, useVendorOptions, useProjectOptions } from '@/hooks/use-select-options';
import { apiClient } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vendorId: '', projectId: '', totalCost: '', expectedDate: '', notes: '' });

  const { data, isLoading } = usePurchaseOrders({ status: statusFilter || undefined });
  const { options: vendorOptions, isLoading: vLoading } = useVendorOptions();
  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const create = useCreatePurchaseOrder();
  const del = useDeletePurchaseOrder();
  const qc = useQueryClient();
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.updatePurchaseOrder(id, { status } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
  const pos = data?.data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ ...form, totalCost: Number(form.totalCost), items: [] } as any);
    setShowForm(false); setForm({ vendorId: '', projectId: '', totalCost: '', expectedDate: '', notes: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Purchase Orders" subtitle="Manage procurement orders"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New PO</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              options={vendorOptions}
              value={form.vendorId}
              onChange={v => setForm(p => ({ ...p, vendorId: v }))}
              placeholder="Select vendor *"
              loading={vLoading}
              label="Vendor"
            />
            <Select
              options={projectOptions}
              value={form.projectId}
              onChange={v => setForm(p => ({ ...p, projectId: v }))}
              placeholder="Link to project (optional)"
              loading={pLoading}
              clearable
              label="Project"
            />
            <input className="input-base" type="number" placeholder="Total cost (BDT) *" required value={form.totalCost} onChange={e => setForm(p => ({ ...p, totalCost: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Expected date" value={form.expectedDate} onChange={e => setForm(p => ({ ...p, expectedDate: e.target.value }))} />
            <input className="input-base sm:col-span-2" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="sm:w-48">
        <Select
          options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS.po]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Status"
          searchable={false}
        />
      </div>

      <DataTable data={pos as any} isLoading={isLoading} emptyIcon={<ShoppingCart size={40} />} emptyText="No purchase orders."
        columns={[
          { key: 'poNumber', label: 'PO #', render: (r: any) => <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand-500)' }}>{r.poNumber}</span> },
          { key: 'vendorId', label: 'Vendor', render: (r: any) => {
            const v = vendorOptions.find(o => o.value === r.vendorId);
            return <span style={{ color: 'var(--text-secondary)' }}>{v?.label ?? r.vendorId?.slice(0,8)}</span>;
          }},
          { key: 'totalCost', label: 'Total Cost', render: (r: any) => <span className="font-semibold">৳{Number(r.totalCost).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'expectedDate', label: 'Expected', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.expectedDate ? new Date(r.expectedDate).toLocaleDateString() : '—'}</span> },
          { key: 'createdAt', label: 'Created', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              {r.status === 'draft' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'sent' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#2563eb', color: '#2563eb' }}>Send</button>}
              {r.status === 'sent' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'approved' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Approve</button>}
              {r.status === 'approved' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'received' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#9333ea', color: '#9333ea' }}>Mark Received</button>}
              <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
            </div>
          )},
        ]}
      />
    </div>
  );
}
