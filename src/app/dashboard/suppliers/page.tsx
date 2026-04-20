'use client';

import { useState } from 'react';
import { useVendors, useCreateVendor, useDeleteVendor } from '@/hooks/use-procurement';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Package, Plus, Search, Trash2 } from 'lucide-react';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', contactPerson: '' });

  const { data, isLoading } = useVendors({ search: search || undefined });
  const create = useCreateVendor();
  const del = useDeleteVendor();
  const vendors = data?.data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form as any);
    setShowForm(false); setForm({ name: '', phone: '', email: '', address: '', contactPerson: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Vendors / Suppliers" subtitle="Manage your vendor list"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Vendor</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Vendor name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" placeholder="Contact person" value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} />
            <input className="input-base" placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <input className="input-base" type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input className="input-base sm:col-span-2" placeholder="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-base pl-9" placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <DataTable data={vendors as any} isLoading={isLoading} emptyIcon={<Package size={40} />} emptyText="No vendors found."
        columns={[
          { key: 'name', label: 'Vendor', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'contactPerson', label: 'Contact', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.contactPerson ?? '—'}</span> },
          { key: 'phone', label: 'Phone', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.phone ?? '—'}</span> },
          { key: 'email', label: 'Email', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.email ?? '—'}</span> },
          { key: 'isActive', label: 'Status', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: r.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: r.isActive ? '#16a34a' : '#6b7280' }}>{r.isActive ? 'Active' : 'Inactive'}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
          )},
        ]}
      />
    </div>
  );
}
