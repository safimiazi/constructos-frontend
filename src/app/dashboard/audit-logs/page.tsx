'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { ClipboardList, Search } from 'lucide-react';

export default function AuditLogsPage() {
  const [action, setAction] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { action }],
    queryFn: () => apiClient.getAuditLogs({ action: action || undefined }),
  });

  const logs = data?.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Audit Logs" subtitle="Track all system activity" />

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-base pl-9" placeholder="Filter by action…" value={action} onChange={e => setAction(e.target.value)} />
      </div>

      <DataTable data={logs as any} isLoading={isLoading} emptyIcon={<ClipboardList size={40} />} emptyText="No audit logs."
        columns={[
          { key: 'action', label: 'Action', render: (r: any) => <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand-500)' }}>{r.action}</span> },
          { key: 'entityType', label: 'Entity', render: (r: any) => <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{r.entityType ?? '—'}</span> },
          { key: 'userId', label: 'User', render: (r: any) => <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{r.userId ? r.userId.slice(0, 8) + '…' : 'System'}</span> },
          { key: 'ipAddress', label: 'IP', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.ipAddress ?? '—'}</span> },
          { key: 'createdAt', label: 'Time', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleString()}</span> },
        ]}
      />
    </div>
  );
}
