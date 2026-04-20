'use client';

import { useState } from 'react';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/use-projects';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FolderKanban, Plus, Search, Trash2 } from 'lucide-react';
import type { Project } from '@/lib/api';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'residential', location: '', budgetAmount: '', startDate: '', endDate: '' });

  const { data, isLoading } = useProjects({ status: status || undefined });
  const create = useCreateProject();
  const del = useDeleteProject();

  const projects: Project[] = data?.data?.data ?? [];
  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ ...form, budgetAmount: Number(form.budgetAmount) } as any);
    setShowForm(false);
    setForm({ name: '', type: 'residential', location: '', budgetAmount: '', startDate: '', endDate: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Projects" subtitle="Manage all construction projects"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}><Plus size={16} />New Project</button>} />

      {showForm && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Create Project</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Project name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <select className="input-base" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {['residential','commercial','industrial','infrastructure','renovation'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="input-base" placeholder="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Budget (BDT)" value={form.budgetAmount} onChange={e => setForm(p => ({ ...p, budgetAmount: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Start date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            <input className="input-base" type="date" placeholder="End date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-base pl-9" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-base sm:w-44" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {['planning','active','on_hold','completed','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      <DataTable
        data={filtered as any}
        isLoading={isLoading}
        emptyIcon={<FolderKanban size={40} />}
        emptyText="No projects found. Create your first project."
        columns={[
          { key: 'name', label: 'Project', render: (r: any) => (
            <div>
              <a href={`/dashboard/projects/${r.id}`} className="font-medium hover:underline" style={{ color: 'var(--brand-500)' }}>{r.name}</a>
              {r.location && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.location}</p>}
            </div>
          )},
          { key: 'type', label: 'Type', render: (r: any) => <span className="capitalize text-xs" style={{ color: 'var(--text-secondary)' }}>{r.type}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'completionPercentage', label: 'Progress', render: (r: any) => (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${r.completionPercentage}%`, background: 'var(--brand-500)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.completionPercentage}%</span>
            </div>
          )},
          { key: 'budgetAmount', label: 'Budget', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>৳{Number(r.budgetAmount).toLocaleString()}</span> },
          { key: 'startDate', label: 'Start', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.startDate ? new Date(r.startDate).toLocaleDateString() : '—'}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}>
              <Trash2 size={14} />
            </button>
          )},
        ]}
      />
    </div>
  );
}
