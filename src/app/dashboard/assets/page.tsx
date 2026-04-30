'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { Shield, Plus, AlertTriangle } from 'lucide-react';

const ASSET_CATEGORY_OPTIONS = [
  { value: 'Heavy Equipment', label: 'Heavy Equipment' },
  { value: 'Vehicle', label: 'Vehicle' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Tools', label: 'Tools' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'IT Equipment', label: 'IT Equipment' },
  { value: 'Other', label: 'Other' },
];

// Assets are tracked as inventory items with a category prefix
// This reuses the existing /procurement/inventory endpoint
export default function AssetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ materialName: '', unit: 'unit', qtyInHand: '1', reorderLevel: '0', unitCost: '', location: '' });
  const [categoryFilter, setCategoryFilter] = useState('');

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', { search }],
    queryFn: () => extendedApiClient.getInventory({ search: search || undefined }),
  });
  const create = useMutation({
    mutationFn: extendedApiClient.createInventoryItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setShowForm(false); setForm({ materialName: '', unit: 'unit', qtyInHand: '1', reorderLevel: '0', unitCost: '', location: '' }); },
  });

  const allItems = (data?.data as any[]) ?? [];
  // Filter to asset-like items (unit = 'unit' or category-tagged)
  const assets = categoryFilter
    ? allItems.filter((i: any) => i.materialName?.startsWith(`[${categoryFilter}]`))
    : allItems;

  const totalValue = assets.reduce((s: number, a: any) => s + (Number(a.unitCost) * Number(a.qtyInHand)), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.materialName;
    create.mutate({ ...form, qtyInHand: Number(form.qtyInHand), reorderLevel: Number(form.reorderLevel), unitCost: Number(form.unitCost), materialName: name });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Assets" subtitle="Track company assets & equipment"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Asset</button>} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Assets', value: String(assets.length), color: '#9333ea' },
          { label: 'Total Value', value: `৳${totalValue.toLocaleString()}`, color: '#3b82f6' },
          { label: 'Locations', value: String(new Set(assets.map((a: any) => a.location).filter(Boolean)).size), color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Add Asset</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Asset name *" required value={form.materialName} onChange={e => setForm(p => ({ ...p, materialName: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Purchase cost (BDT)" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Quantity" value={form.qtyInHand} onChange={e => setForm(p => ({ ...p, qtyInHand: e.target.value }))} />
            <input className="input-base sm:col-span-2" placeholder="Location / site" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <input className="input-base pl-3" placeholder="Search assets…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="w-52">
          <Select options={[{ value: '', label: 'All Categories' }, ...ASSET_CATEGORY_OPTIONS]} value={categoryFilter} onChange={setCategoryFilter} placeholder="All Categories" searchable={false} />
        </div>
      </div>

      <DataTable data={assets} isLoading={isLoading} emptyIcon={<Shield size={40} />} emptyText="No assets found."
        columns={[
          { key: 'materialName', label: 'Asset', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.materialName}</span> },
          { key: 'unitCost', label: 'Value', render: (r: any) => <span className="font-semibold" style={{ color: '#16a34a' }}>৳{Number(r.unitCost).toLocaleString()}</span> },
          { key: 'qtyInHand', label: 'Qty', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.qtyInHand}</span> },
          { key: 'location', label: 'Location', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.location ?? '—'}</span> },
          { key: 'status', label: 'Status', render: (r: any) => (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: Number(r.qtyInHand) > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: Number(r.qtyInHand) > 0 ? '#16a34a' : '#6b7280' }}>
              {Number(r.qtyInHand) > 0 ? 'Active' : 'Disposed'}
            </span>
          )},
        ]}
      />
    </div>
  );
}
