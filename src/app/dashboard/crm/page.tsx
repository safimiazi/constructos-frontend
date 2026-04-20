'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, TrendingUp, Plus, Trash2 } from 'lucide-react';

type Tab = 'clients' | 'leads';

const LEAD_STAGES = ['new','qualified','proposal','negotiation','won','lost'];

export default function CrmPage() {
  const [tab, setTab] = useState<Tab>('clients');
  const [showForm, setShowForm] = useState(false);
  const [stageFilter, setStageFilter] = useState('');
  const [clientForm, setClientForm] = useState({ name: '', type: 'company', contactPerson: '', email: '', phone: '', address: '' });
  const [leadForm, setLeadForm] = useState({ name: '', source: '', expectedValue: '', expectedCloseDate: '' });

  const qc = useQueryClient();
  const { data: clientsData, isLoading: cLoading } = useQuery({ queryKey: ['crm-clients'], queryFn: () => extendedApiClient.getClients() });
  const { data: leadsData, isLoading: lLoading } = useQuery({ queryKey: ['crm-leads', stageFilter], queryFn: () => extendedApiClient.getLeadsList({ stage: stageFilter || undefined }) });
  const { data: pipelineData } = useQuery({ queryKey: ['crm-pipeline'], queryFn: extendedApiClient.getPipelineSummary });

  const createClient = useMutation({ mutationFn: extendedApiClient.createClient, onSuccess: () => { qc.invalidateQueries({ queryKey: ['crm-clients'] }); setShowForm(false); } });
  const createLead = useMutation({ mutationFn: extendedApiClient.createLead, onSuccess: () => { qc.invalidateQueries({ queryKey: ['crm-leads'] }); setShowForm(false); } });
  const moveStage = useMutation({ mutationFn: ({ id, stage }: { id: string; stage: string }) => extendedApiClient.moveLeadStage(id, stage), onSuccess: () => qc.invalidateQueries({ queryKey: ['crm-leads'] }) });
  const deleteClient = useMutation({ mutationFn: extendedApiClient.deleteClient, onSuccess: () => qc.invalidateQueries({ queryKey: ['crm-clients'] }) });
  const deleteLead = useMutation({ mutationFn: extendedApiClient.deleteLead, onSuccess: () => qc.invalidateQueries({ queryKey: ['crm-leads'] }) });

  const clients = clientsData?.data?.data ?? [];
  const leads = leadsData?.data?.data ?? [];
  const pipeline = pipelineData?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="CRM" subtitle="Clients & Sales Pipeline"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />{tab === 'clients' ? 'Add Client' : 'Add Lead'}</button>} />

      {/* Pipeline summary */}
      {pipeline.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {LEAD_STAGES.map(stage => {
            const s = pipeline.find((p: any) => p.stage === stage);
            return (
              <div key={stage} className="card p-3 text-center cursor-pointer" onClick={() => { setTab('leads'); setStageFilter(stage); }}
                style={{ borderColor: stageFilter === stage ? 'var(--brand-500)' : 'var(--border)' }}>
                <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{stage}</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{s?.count ?? 0}</p>
                {s?.totalValue && <p className="text-xs" style={{ color: 'var(--brand-500)' }}>৳{Number(s.totalValue).toLocaleString()}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--bg-muted)' }}>
        {(['clients', 'leads'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize"
            style={{ background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Forms */}
      {showForm && tab === 'clients' && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); createClient.mutate(clientForm); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Client name *" required value={clientForm.name} onChange={e => setClientForm(p => ({ ...p, name: e.target.value }))} />
            <select className="input-base" value={clientForm.type} onChange={e => setClientForm(p => ({ ...p, type: e.target.value }))}>
              <option value="company">Company</option><option value="individual">Individual</option>
            </select>
            <input className="input-base" placeholder="Contact person" value={clientForm.contactPerson} onChange={e => setClientForm(p => ({ ...p, contactPerson: e.target.value }))} />
            <input className="input-base" type="email" placeholder="Email" value={clientForm.email} onChange={e => setClientForm(p => ({ ...p, email: e.target.value }))} />
            <input className="input-base" placeholder="Phone" value={clientForm.phone} onChange={e => setClientForm(p => ({ ...p, phone: e.target.value }))} />
            <input className="input-base" placeholder="Address" value={clientForm.address} onChange={e => setClientForm(p => ({ ...p, address: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={createClient.isPending} className="btn-primary">{createClient.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showForm && tab === 'leads' && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); createLead.mutate({ ...leadForm, expectedValue: Number(leadForm.expectedValue) }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Lead name *" required value={leadForm.name} onChange={e => setLeadForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" placeholder="Source (referral, website…)" value={leadForm.source} onChange={e => setLeadForm(p => ({ ...p, source: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Expected value (BDT)" value={leadForm.expectedValue} onChange={e => setLeadForm(p => ({ ...p, expectedValue: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Expected close date" value={leadForm.expectedCloseDate} onChange={e => setLeadForm(p => ({ ...p, expectedCloseDate: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={createLead.isPending} className="btn-primary">{createLead.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Clients table */}
      {tab === 'clients' && (
        <DataTable data={clients as any} isLoading={cLoading} emptyIcon={<Users size={40} />} emptyText="No clients yet."
          columns={[
            { key: 'name', label: 'Client', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
            { key: 'type', label: 'Type', render: (r: any) => <span className="capitalize text-xs" style={{ color: 'var(--text-secondary)' }}>{r.type}</span> },
            { key: 'contactPerson', label: 'Contact', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.contactPerson ?? '—'}</span> },
            { key: 'email', label: 'Email', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.email ?? '—'}</span> },
            { key: 'phone', label: 'Phone', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.phone ?? '—'}</span> },
            { key: 'actions', label: '', render: (r: any) => <button onClick={() => deleteClient.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={14} /></button> },
          ]}
        />
      )}

      {/* Leads table */}
      {tab === 'leads' && (
        <>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setStageFilter('')} className="text-xs px-3 py-1.5 rounded-full border transition-colors"
              style={{ background: !stageFilter ? 'var(--brand-500)' : 'transparent', color: !stageFilter ? '#fff' : 'var(--text-secondary)', borderColor: !stageFilter ? 'var(--brand-500)' : 'var(--border)' }}>All</button>
            {LEAD_STAGES.map(s => (
              <button key={s} onClick={() => setStageFilter(s)} className="text-xs px-3 py-1.5 rounded-full border capitalize transition-colors"
                style={{ background: stageFilter === s ? 'var(--brand-500)' : 'transparent', color: stageFilter === s ? '#fff' : 'var(--text-secondary)', borderColor: stageFilter === s ? 'var(--brand-500)' : 'var(--border)' }}>{s}</button>
            ))}
          </div>
          <DataTable data={leads as any} isLoading={lLoading} emptyIcon={<TrendingUp size={40} />} emptyText="No leads found."
            columns={[
              { key: 'name', label: 'Lead', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
              { key: 'stage', label: 'Stage', render: (r: any) => <StatusBadge status={r.stage} /> },
              { key: 'expectedValue', label: 'Value', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>৳{Number(r.expectedValue).toLocaleString()}</span> },
              { key: 'source', label: 'Source', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.source ?? '—'}</span> },
              { key: 'expectedCloseDate', label: 'Close Date', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.expectedCloseDate ? new Date(r.expectedCloseDate).toLocaleDateString() : '—'}</span> },
              { key: 'actions', label: '', render: (r: any) => (
                <div className="flex gap-1">
                  <select className="text-xs border rounded px-1 py-0.5" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                    value={r.stage} onChange={e => moveStage.mutate({ id: r.id, stage: e.target.value })}>
                    {LEAD_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => deleteLead.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
                </div>
              )},
            ]}
          />
        </>
      )}
    </div>
  );
}
