'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { Megaphone, Plus, Trash2 } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'info', label: 'Info', description: 'General information' },
  { value: 'warning', label: 'Warning', description: 'Important notice' },
  { value: 'maintenance', label: 'Maintenance', description: 'Scheduled downtime' },
];

export default function AnnouncementsManagePage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', expiresAt: '' });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['announcements'], queryFn: apiV2.getAnnouncements });
  const create = useMutation({ mutationFn: apiV2.createAnnouncement, onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements'] }); setShowForm(false); setForm({ title: '', message: '', type: 'info', expiresAt: '' }); } });
  const del = useMutation({ mutationFn: apiV2.deleteAnnouncement, onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }) });
  const toggle = useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiV2.updateAnnouncement(id, { isActive }), onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }) });
  const announcements = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Announcements" subtitle="Broadcast messages to all tenants"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Announcement</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <textarea className="input-base sm:col-span-2" rows={3} placeholder="Message *" required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
            <Select options={TYPE_OPTIONS} value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} placeholder="Type" label="Type" searchable={false} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Expires At (optional)</label>
              <input className="input-base" type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Sending…' : 'Send'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={announcements} isLoading={isLoading} emptyIcon={<Megaphone size={40} />} emptyText="No announcements yet."
        columns={[
          { key: 'title', label: 'Title', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span> },
          { key: 'type', label: 'Type', render: (r: any) => <span className="capitalize text-xs px-2 py-0.5 rounded-full" style={{ background: r.type === 'warning' ? 'rgba(245,158,11,0.12)' : r.type === 'maintenance' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)', color: r.type === 'warning' ? '#d97706' : r.type === 'maintenance' ? '#dc2626' : '#2563eb' }}>{r.type}</span> },
          { key: 'isActive', label: 'Status', render: (r: any) => (
            <button onClick={() => toggle.mutate({ id: r.id, isActive: !r.isActive })} className="text-xs px-2 py-0.5 rounded-full" style={{ background: r.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: r.isActive ? '#16a34a' : '#6b7280' }}>
              {r.isActive ? 'Active' : 'Inactive'}
            </button>
          )},
          { key: 'expiresAt', label: 'Expires', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : 'Never'}</span> },
          { key: 'actions', label: '', render: (r: any) => <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={14} /></button> },
        ]}
      />
    </div>
  );
}
