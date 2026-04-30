'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTenant, useUpdateTenantStatus } from '@/hooks/use-superadmin';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useTenant(id);
  const updateStatus = useUpdateTenantStatus();
  const tenant = data?.data;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!tenant) return <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Tenant not found.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/dashboard/organizations" className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} /> Back to Tenants
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.12)' }}>
            <Building2 size={24} style={{ color: '#9333ea' }} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{tenant.companyName}</h1>
            <p className="text-sm mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{tenant.slug}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={tenant.status} />
            </div>
          </div>
          <div className="flex gap-2">
            {tenant.status !== 'active' && (
              <button onClick={() => updateStatus.mutate({ id: tenant.id, status: 'active' })} className="btn-primary text-sm py-1.5 px-3">Activate</button>
            )}
            {tenant.status === 'active' && (
              <button onClick={() => updateStatus.mutate({ id: tenant.id, status: 'suspended' })} className="btn-secondary text-sm py-1.5 px-3" style={{ color: '#dc2626', borderColor: '#dc2626' }}>Suspend</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Currency', value: tenant.currency },
            { label: 'Timezone', value: tenant.timezone },
            { label: 'Trial Ends', value: tenant.trialEndsAt ? new Date(tenant.trialEndsAt).toLocaleDateString() : '—' },
            { label: 'Plan ID', value: tenant.planId ? tenant.planId.slice(0, 8) + '…' : 'No plan' },
            { label: 'Tenant ID', value: tenant.id.slice(0, 8) + '…' },
            { label: 'Created', value: new Date(tenant.createdAt).toLocaleDateString() },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
