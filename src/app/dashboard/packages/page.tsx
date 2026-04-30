'use client';
import { useState } from 'react';
import { usePlans, useCreatePlan } from '@/hooks/use-superadmin';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { Package, Plus } from 'lucide-react';
import { PLAN_TIER_OPTIONS } from '@/hooks/use-select-options';

export default function PackagesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', tier: 'STARTER', priceMonthly: '', priceAnnual: '', maxUsers: '', maxProjects: '', storageGb: '5' });
  const { data, isLoading } = usePlans();
  const create = useCreatePlan();
  const plans = (data?.data as any) ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ ...form, priceMonthly: Number(form.priceMonthly), priceAnnual: Number(form.priceAnnual), maxUsers: form.maxUsers ? Number(form.maxUsers) : null, maxProjects: form.maxProjects ? Number(form.maxProjects) : null, storageGb: Number(form.storageGb), features: {} } as any);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Subscription Plans" subtitle="Manage ConstructOS pricing plans"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Plan</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input-base" placeholder="Plan name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <Select options={PLAN_TIER_OPTIONS} value={form.tier} onChange={v => setForm(p => ({ ...p, tier: v }))} placeholder="Tier" label="Tier" searchable={false} />
            <input className="input-base" type="number" placeholder="Monthly price (BDT) *" required value={form.priceMonthly} onChange={e => setForm(p => ({ ...p, priceMonthly: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Annual price (BDT) *" required value={form.priceAnnual} onChange={e => setForm(p => ({ ...p, priceAnnual: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Max users (blank = unlimited)" value={form.maxUsers} onChange={e => setForm(p => ({ ...p, maxUsers: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Max projects (blank = unlimited)" value={form.maxProjects} onChange={e => setForm(p => ({ ...p, maxProjects: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Storage GB *" required value={form.storageGb} onChange={e => setForm(p => ({ ...p, storageGb: e.target.value }))} />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={plans} isLoading={isLoading} emptyIcon={<Package size={40} />} emptyText="No plans yet."
        columns={[
          { key: 'name', label: 'Plan', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'tier', label: 'Tier', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>{r.tier}</span> },
          { key: 'priceMonthly', label: 'Monthly', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(r.priceMonthly).toLocaleString()}</span> },
          { key: 'priceAnnual', label: 'Annual', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>৳{Number(r.priceAnnual).toLocaleString()}</span> },
          { key: 'maxUsers', label: 'Max Users', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.maxUsers ?? 'Unlimited'}</span> },
          { key: 'storageGb', label: 'Storage', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.storageGb} GB</span> },
          { key: 'isActive', label: 'Status', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: r.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: r.isActive ? '#16a34a' : '#6b7280' }}>{r.isActive ? 'Active' : 'Inactive'}</span> },
        ]}
      />
    </div>
  );
}
