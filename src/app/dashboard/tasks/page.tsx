'use client';

import { useState } from 'react';
import { useProjects, useTasks, useCreateTask, projectKeys } from '@/hooks/use-projects';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { ClipboardList, Plus } from 'lucide-react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, useProjectOptions, useUserOptions } from '@/hooks/use-select-options';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

function ProgressSlider({ taskId, projectId, value, status }: { taskId: string; projectId: string; value: number; status: string }) {
  const [local, setLocal] = useState(Number(value));
  const qc = useQueryClient();

  const handleChange = async (val: number) => {
    setLocal(val);
    const newStatus = val === 100 ? 'done' : val > 0 ? 'in_progress' : status;
    await apiClient.updateTask(projectId, taskId, { progressPct: val, status: newStatus } as any);
    // Invalidate both tasks and projects so progress bar updates without reload
    qc.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
    qc.invalidateQueries({ queryKey: projectKeys.all });
  };

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <input
        type="range" min={0} max={100} step={5}
        value={local}
        className="w-20 cursor-pointer accent-purple-600"
        onChange={e => setLocal(Number(e.target.value))}
        onMouseUp={e => handleChange(Number((e.target as HTMLInputElement).value))}
      />
      <span className="text-xs w-8 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>{local}%</span>
    </div>
  );
}

export default function TasksPage() {
  const [projectId, setProjectId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '', assignedTo: '', status: 'todo' });

  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const { options: userOptions, isLoading: uLoading } = useUserOptions();
  const { data: tasksData, isLoading } = useTasks(projectId);
  const create = useCreateTask(projectId);
  const tasks = (tasksData?.data as any) ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    await create.mutateAsync({ ...form, assignedTo: form.assignedTo || undefined } as any);
    setShowForm(false); setForm({ title: '', priority: 'medium', dueDate: '', assignedTo: '', status: 'todo' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Tasks" subtitle="View and manage project tasks"
        action={projectId && <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Task</button>} />

      <div className="w-72">
        <Select
          options={projectOptions}
          value={projectId}
          onChange={setProjectId}
          placeholder="Select a project…"
          loading={pLoading}
          label="Project"
        />
      </div>

      {showForm && projectId && (
        <div className="card p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Task title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <Select options={PRIORITY_OPTIONS} value={form.priority} onChange={v => setForm(p => ({ ...p, priority: v }))} placeholder="Priority" label="Priority" searchable={false} />
            <Select options={STATUS_OPTIONS.task} value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} placeholder="Status" label="Status" searchable={false} />
            <Select options={userOptions} value={form.assignedTo} onChange={v => setForm(p => ({ ...p, assignedTo: v }))} placeholder="Assign to (optional)" loading={uLoading} clearable label="Assigned To" />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
              <input className="input-base" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
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
            { key: 'assignedTo', label: 'Assigned To', render: (r: any) => {
              const u = userOptions.find(o => o.value === r.assignedTo);
              return <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u?.label ?? (r.assignedTo ? r.assignedTo.slice(0,8) : '—')}</span>;
            }},
            { key: 'priority', label: 'Priority', render: (r: any) => <StatusBadge status={r.priority} /> },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
            { key: 'progressPct', label: 'Progress', render: (r: any) => (
              <ProgressSlider
                taskId={r.id}
                projectId={projectId}
                value={r.progressPct}
                status={r.status}
              />
            )},
            { key: 'dueDate', label: 'Due', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}</span> },
          ]}
        />
      )}
    </div>
  );
}
