'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV3, setAccessToken } from '@/lib/api';
import { useTenants, useUpdateTenantStatus } from '@/hooks/use-superadmin';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { Building2, Search, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TENANT_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useTenants({ search: search || undefined, status: statusFilter || undefined });
  const updateStatus = useUpdateTenantStatus();
  const tenants = data?.data?.data ?? [];

  const impersonate = useMutation({
    mutationFn: (tenantId: string) => apiV3.impersonateTenant(tenantId),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken);
      localStorage.setItem('cos_user', JSON.stringify(res.data.user));
      qc.clear();
      router.push('/dashboard');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Tenants" subtitle="All registered companies on ConstructOS" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-base pl-9" placeholder="Search tenants…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="sm:w-48">
          <Select options={TENANT_STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" searchable={false} />
        </div>
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
            <div className="flex gap-1 flex-wrap">
              {r.status !== 'active' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'active' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Activate</button>}
              {r.status === 'active' && <button onClick={() => updateStatus.mutate({ id: r.id, status: 'suspended' })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#dc2626', color: '#dc2626' }}>Suspend</button>}
              <button onClick={() => impersonate.mutate(r.id)} disabled={impersonate.isPending} className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#9333ea', color: '#9333ea' }}>
                <UserCheck size={11} />Login as
              </button>
            </div>
          )},
        ]}
      />
    </div>
  );
}
