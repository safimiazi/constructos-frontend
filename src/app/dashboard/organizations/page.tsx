'use client';

import { useState } from 'react';
import { useTenants, useUpdateTenantStatus } from '@/hooks/use-superadmin';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Building2, Search } from 'lucide-react';

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useTenants({ search: search || undefined, status: statusFilter || undefined });
  const updateStatus = useUpdateTenantStatus();
  const tenants = data?.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Tenants" subtitle="All registered companies on ConstructOS" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-base pl-9" placeholder="Search tenants…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-base sm:w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['active','trial','suspended','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable data={tenants as any} isLoading={isLoading} emptyIcon={<Building2 size={40} />} emptyText="No tenants found."
        columns={[
          { key: 'companyName', label: 'Company', render: (r: any) => (
            <div>
              <a href={`/dashboard/organizations/${r.id}`} className="font-medium hover:underline" style={{ color: 'var(--brand-500)' }}>{r.companyName}</a>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.slug}</p>
            </div>
          )},
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'currency', label: 'Currency', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.currency}</span> },
          { key: 'trialEndsAt', label: 'Trial Ends', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.trialEndsAt ? new Date(r.trialEndsAt).toLocaleDateString() : '—'}</span> },
          { key: 'createdAt', label: 'Joined', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              {r.status !== 'active' && (
                <button onClick={() => updateStatus.mutate({ id: r.id, status: 'active' })} className="text-xs px-2 py-1 rounded border transition-colors" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Activate</button>
              )}
              {r.status === 'active' && (
                <button onClick={() => updateStatus.mutate({ id: r.id, status: 'suspended' })} className="text-xs px-2 py-1 rounded border transition-colors" style={{ borderColor: '#dc2626', color: '#dc2626' }}>Suspend</button>
              )}
            </div>
          )},
        ]}
      />
    </div>
  );
}
