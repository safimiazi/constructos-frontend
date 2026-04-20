'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProject, useTasks, useCreateTask, useDailyLogs, useCreateDailyLog } from '@/hooks/use-projects';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { ArrowLeft, Plus, ClipboardList, BookOpen } from 'lucide-react';

type Tab = 'tasks' | 'daily-logs';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', dueDate: '' });
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().split('T')[0], workDone: '', progressPct: '0', blockers: '', workersCount: '0' });

  const { data: projectData, isLoading: pLoading } = useProject(id);
  const { data: tasksData, isLoading: tLoading } = useTasks(id);
  const { data: logsData, isLoading: lLoading } = useDailyLogs(id);
  const createTask = useCreateTask(id);
  const createLog = useCreateDailyLog(id);

  const project = projectData?.data;
  const tasks = (tasksData?.data as any) ?? [];
  const logs = (logsData?.data as any) ?? [];

  if (pLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!project) return <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Project not found.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects" className="flex items-center gap-1.5 text-sm mb-3 hover:underline" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="page-title">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={project.status} />
              <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{project.type}</span>
              {project.location && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>📍 {project.location}</span>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Budget</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>৳{Number(project.budgetAmount).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Overall Progress</span>
          <span className="text-sm font-bold" style={{ color: 'var(--brand-500)' }}>{project.completionPercentage}%</span>
        </div>
        <div className="h-3 rounded-full" style={{ background: 'var(--border)' }}>
          <div className="h-3 rounded-full transition-all" style={{ width: `${project.completionPercentage}%`, background: 'linear-gradient(90deg, var(--brand-600), var(--brand-400))' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {[
            { label: 'Start Date', value: project.startDate ? new Date(project.startDate).toLocaleDateString() : '—' },
            { label: 'End Date', value: project.endDate ? new Date(project.endDate).toLocaleDateString() : '—' },
            { label: 'Contract #', value: project.contractNumber ?? '—' },
            { label: 'Created', value: new Date(project.createdAt).toLocaleDateString() },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--bg-muted)' }}>
        {(['tasks', 'daily-logs'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize"
            style={{ background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowTaskForm(v => !v)}><Plus size={16} />Add Task</button>
          </div>
          {showTaskForm && (
            <div className="card p-4">
              <form onSubmit={async e => { e.preventDefault(); await createTask.mutateAsync(taskForm as any); setShowTaskForm(false); setTaskForm({ title: '', priority: 'medium', dueDate: '' }); }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input className="input-base sm:col-span-2" placeholder="Task title *" required value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} />
                <select className="input-base" value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}>
                  {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input className="input-base" type="date" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} />
                <div className="sm:col-span-3 flex gap-2">
                  <button type="submit" disabled={createTask.isPending} className="btn-primary">{createTask.isPending ? 'Adding…' : 'Add'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowTaskForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
          <DataTable data={tasks} isLoading={tLoading} emptyIcon={<ClipboardList size={36} />} emptyText="No tasks yet."
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
        </div>
      )}

      {/* Daily Logs Tab */}
      {tab === 'daily-logs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowLogForm(v => !v)}><Plus size={16} />Submit Log</button>
          </div>
          {showLogForm && (
            <div className="card p-4">
              <form onSubmit={async e => { e.preventDefault(); await createLog.mutateAsync({ ...logForm, progressPct: Number(logForm.progressPct), workersCount: Number(logForm.workersCount) } as any); setShowLogForm(false); }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input-base" type="date" required value={logForm.date} onChange={e => setLogForm(p => ({ ...p, date: e.target.value }))} />
                <input className="input-base" type="number" min="0" max="100" placeholder="Progress % *" required value={logForm.progressPct} onChange={e => setLogForm(p => ({ ...p, progressPct: e.target.value }))} />
                <textarea className="input-base sm:col-span-2" rows={3} placeholder="Work done today *" required value={logForm.workDone} onChange={e => setLogForm(p => ({ ...p, workDone: e.target.value }))} />
                <input className="input-base" placeholder="Blockers (if any)" value={logForm.blockers} onChange={e => setLogForm(p => ({ ...p, blockers: e.target.value }))} />
                <input className="input-base" type="number" placeholder="Workers on site" value={logForm.workersCount} onChange={e => setLogForm(p => ({ ...p, workersCount: e.target.value }))} />
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={createLog.isPending} className="btn-primary">{createLog.isPending ? 'Submitting…' : 'Submit'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowLogForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
          <DataTable data={logs} isLoading={lLoading} emptyIcon={<BookOpen size={36} />} emptyText="No daily logs yet."
            columns={[
              { key: 'date', label: 'Date', render: (r: any) => <span className="font-medium">{new Date(r.date).toLocaleDateString()}</span> },
              { key: 'workDone', label: 'Work Done', render: (r: any) => <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.workDone}</span> },
              { key: 'progressPct', label: 'Progress', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--brand-500)' }}>{r.progressPct}%</span> },
              { key: 'workersCount', label: 'Workers', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.workersCount}</span> },
              { key: 'blockers', label: 'Blockers', render: (r: any) => <span className="text-xs" style={{ color: r.blockers ? '#dc2626' : 'var(--text-muted)' }}>{r.blockers || 'None'}</span> },
            ]}
          />
        </div>
      )}
    </div>
  );
}
