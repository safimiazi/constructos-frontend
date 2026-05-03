'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Package, Plus, Search, AlertTriangle } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { UNIT_OPTIONS } from '@/hooks/use-select-options';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ materialName: '', unit: '', qtyInHand: '', reorderLevel: '', unitCost: '', location: '' });

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['inventory', { search, lowStock }], queryFn: () => extendedApiClient.getInventory({ search: search || undefined, lowStock: lowStock || undefined }) });
  const create = useMutation({ mutationFn: extendedApiClient.createInventoryItem, onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setShowForm(false); } });

  const items = (data?.data as any) ?? [];
  const lowStockCount = items.filter((i: any) => Number(i.qtyInHand) <= Number(i.reorderLevel)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Inventory" subtitle="Stock levels & materials"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Item</button>} />

      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <AlertTriangle size={16} style={{ color: '#d97706' }} />
          <p className="text-sm" style={{ color: '#d97706' }}>{lowStockCount} item(s) below reorder level</p>
        </div>
      )}

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, qtyInHand: Number(form.qtyInHand), reorderLevel: Number(form.reorderLevel), unitCost: Number(form.unitCost) }); }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Material name *" required value={form.materialName} onChange={e => setForm(p => ({ ...p, materialName: e.target.value }))} />
            <Select options={UNIT_OPTIONS} value={form.unit} onChange={v => setForm(p => ({ ...p, unit: v }))} placeholder="Unit *" searchable={false} />
            <input className="input-base" type="number" placeholder="Qty in hand *" required value={form.qtyInHand} onChange={e => setForm(p => ({ ...p, qtyInHand: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Reorder level" value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Unit cost (BDT)" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} />
            <input className="input-base" placeholder="Location / site" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-base pl-9" placeholder="Search materials…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)} className="rounded" />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Low stock only</span>
        </label>
      </div>

      <DataTable data={items} isLoading={isLoading} emptyIcon={<Package size={40} />} emptyText="No inventory items."
        columns={[
          { key: 'materialName', label: 'Material', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.materialName}</span> },
          { key: 'unit', label: 'Unit', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.unit}</span> },
          { key: 'qtyInHand', label: 'In Stock', render: (r: any) => (
            <span className="font-semibold" style={{ color: Number(r.qtyInHand) <= Number(r.reorderLevel) ? '#dc2626' : 'var(--text-primary)' }}>
              {r.qtyInHand}
              {Number(r.qtyInHand) <= Number(r.reorderLevel) && <AlertTriangle size={12} className="inline ml-1" style={{ color: '#dc2626' }} />}
            </span>
          )},
          { key: 'reorderLevel', label: 'Reorder At', render: (r: any) => <span style={{ color: 'var(--text-muted)' }}>{r.reorderLevel}</span> },
          { key: 'unitCost', label: 'Unit Cost', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>৳{Number(r.unitCost).toLocaleString()}</span> },
          { key: 'location', label: 'Location', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.location ?? '—'}</span> },
        ]}
      />
    </div>
  );
}
