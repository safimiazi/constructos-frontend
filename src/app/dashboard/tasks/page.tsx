'use client';

import { useState } from 'react';
import { useProjects, useTasks, useCreateTask } from '@/hooks/use-projects';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList, Plus } from 'lucide-react';

export default function TasksPage() {
  const [projectId, setProjectId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '' });

  const { data: projectsData } = useProjects();
  const { data: tasksData, isLoading } = useTasks(projectId);
  const create = useCreateTask(projectId);

  const projects = projectsData?.data?.data ?? [];
  const tasks = (tasksData?.data as any) ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    await create.mutateAsync(form as any);
    setShowForm(false); setForm({ title: '', priority: 'medium', dueDate: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Tasks" subtitle="View and manage project tasks"
        action={projectId && <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Task</button>} />

      <select className="input-base w-64" value={projectId} onChange={e => setProjectId(e.target.value)}>
        <option value="">Select a project…</option>
        {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {showForm && projectId && (
        <div className="card p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Task title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <select className="input-base" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input className="input-base" type="date" placeholder="Due date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Adding…' : 'Add Task'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!projectId ? (
        <div className="card p-12 text-center">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Select a project to view tasks.</p>
        </div>
      ) : (
        <DataTable data={tasks} isLoading={isLoading} emptyIcon={<ClipboardList size={40} />} emptyText="No tasks for this project."
          columns={[
            { key: 'title', label: 'Task', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span> },
            { key: 'priority', label: 'Priority', render: (r: any) => <StatusBadge status={r.priority} /> },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
            { key: 'progressPct', label: 'Progress', render: (r: any) => (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${r.progressPct}%`, background: 'var(--brand-500)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.progressPct}%</span>
              </div>
            )},
            { key: 'dueDate', label: 'Due', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}</span> },
          ]}
        />
      )}
    </div>
  );
}
