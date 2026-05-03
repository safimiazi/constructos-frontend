'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV5, extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { Shield, Plus, X } from 'lucide-react';
import { INCIDENT_TYPE_OPTIONS, SEVERITY_OPTIONS, STATUS_OPTIONS, useProjectOptions } from '@/hooks/use-select-options';

const BLANK = { projectId: '', incidentDate: new Date().toISOString().split('T')[0], type: 'near_miss', severity: 'medium', description: '', injuredPerson: '' };

export default function HsePage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState(BLANK);

  const qc = useQueryClient();
  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const { data, isLoading } = useQuery({ queryKey: ['incidents', statusFilter], queryFn: () => extendedApiClient.getIncidents({ status: statusFilter || undefined }) });
  const create = useMutation({ mutationFn: extendedApiClient.createIncident, onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); setShowForm(false); setForm(BLANK); } });
  const close = useMutation({ mutationFn: extendedApiClient.closeIncident, onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }) });

  const incidents: any[] = Array.isArray(data?.data) ? data.data : (data?.data as any)?.data ?? [];
  const totalOpen = incidents.filter((i: any) => i.status === 'open').length;
  const totalCritical = incidents.filter((i: any) => i.severity === 'critical').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="HSE" subtitle="Health, Safety & Environment"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Report Incident</button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: String(incidents.length), color: '#9333ea' },
          { label: 'Open', value: String(totalOpen), color: '#f59e0b' },
          { label: 'Critical', value: String(totalCritical), color: '#dc2626' },
          { label: 'Closed', value: String(incidents.filter((i: any) => i.status === 'closed').length), color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select options={projectOptions} value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} placeholder="Select project *" loading={pLoading} label="Project" />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Incident Date</label>
              <input className="input-base" type="date" required value={form.incidentDate} onChange={e => setForm(p => ({ ...p, incidentDate: e.target.value }))} />
            </div>
            <Select options={INCIDENT_TYPE_OPTIONS} value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} placeholder="Incident type" label="Type" searchable={false} />
            <Select options={SEVERITY_OPTIONS} value={form.severity} onChange={v => setForm(p => ({ ...p, severity: v }))} placeholder="Severity" label="Severity" searchable={false} />
            <textarea className="input-base sm:col-span-2" rows={3} placeholder="Description *" required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <input className="input-base" placeholder="Injured person (if any)" value={form.injuredPerson} onChange={e => setForm(p => ({ ...p, injuredPerson: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Reporting…' : 'Report'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="w-48">
        <Select options={[{ value: '', label: 'All Status' }, { value: 'open', label: 'Open' }, { value: 'investigating', label: 'Investigating' }, { value: 'closed', label: 'Closed' }]} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" searchable={false} />
      </div>

      <DataTable data={incidents as any} isLoading={isLoading} emptyIcon={<Shield size={40} />} emptyText="No incidents reported."
        columns={[
          { key: 'incidentDate', label: 'Date', render: (r: any) => <span className="font-medium">{new Date(r.incidentDate).toLocaleDateString()}</span> },
          { key: 'type', label: 'Type', render: (r: any) => <span className="capitalize text-xs" style={{ color: 'var(--text-secondary)' }}>{r.type?.replace(/_/g,' ')}</span> },
          { key: 'severity', label: 'Severity', render: (r: any) => <StatusBadge status={r.severity} /> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'description', label: 'Description', render: (r: any) => <span className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{r.description}</span> },
          { key: 'injuredPerson', label: 'Injured', render: (r: any) => <span className="text-xs" style={{ color: r.injuredPerson ? '#dc2626' : 'var(--text-muted)' }}>{r.injuredPerson || 'None'}</span> },
          { key: 'actions', label: '', render: (r: any) => r.status !== 'closed' ? (
            <button onClick={() => close.mutate(r.id)} className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#16a34a', color: '#16a34a' }}><X size={12} />Close</button>
          ) : null },
        ]}
      />
    </div>
  );
}
