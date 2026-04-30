'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProject, useTasks, useCreateTask, useDeleteTask, useDailyLogs, useCreateDailyLog, useMilestones, useCreateMilestone, useUpdateMilestone, useIssues, useCreateIssue, useUpdateIssue, useDefects, useCreateDefect, useUpdateDefect, useDeleteDefect } from '@/hooks/use-projects';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Plus, ClipboardList, BookOpen, Trash2, Edit2, Flag, AlertTriangle, BarChart3 } from 'lucide-react';
import { apiClient, apiV4, extendedApiClient } from '@/lib/api';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, useUserOptions } from '@/hooks/use-select-options';

function BudgetTab({ projectId, project }: { projectId: string; project: any }) {
  const { data: budgetData } = useQuery({
    queryKey: ['budget-summary', projectId],
    queryFn: () => extendedApiClient.getBudgetSummary(projectId),
    enabled: !!projectId,
  });
  const { data: budgetsData } = useQuery({
    queryKey: ['budgets', projectId],
    queryFn: () => extendedApiClient.getBudgets(projectId),
    enabled: !!projectId,
  });
  const summary = budgetData?.data as any;
  const budgets = (budgetsData?.data as any[]) ?? [];
  const approved = Number(project.budgetAmount);
  const actual = Number(summary?.totalActual ?? 0);
  const variance = approved - actual;
  const pctUsed = approved > 0 ? Math.round((actual / approved) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Approved Budget', value: `৳${approved.toLocaleString()}`, color: '#9333ea' },
          { label: 'Actual Spend', value: `৳${actual.toLocaleString()}`, color: '#3b82f6' },
          { label: 'Variance', value: `৳${Math.abs(variance).toLocaleString()}`, color: variance >= 0 ? '#16a34a' : '#dc2626', sub: variance >= 0 ? 'Under budget' : 'Over budget' },
          { label: 'Budget Used', value: `${pctUsed}%`, color: pctUsed > 90 ? '#dc2626' : pctUsed > 70 ? '#f59e0b' : '#16a34a' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            {s.sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>}
          </div>
        ))}
      </div>
      {approved > 0 && (
        <div className="card p-4">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: 'var(--text-muted)' }}>Budget utilization</span>
            <span className="font-semibold" style={{ color: pctUsed > 90 ? '#dc2626' : 'var(--brand-500)' }}>{pctUsed}%</span>
          </div>
          <div className="h-3 rounded-full" style={{ background: 'var(--border)' }}>
            <div className="h-3 rounded-full transition-all" style={{ width: `${Math.min(pctUsed, 100)}%`, background: pctUsed > 90 ? '#dc2626' : pctUsed > 70 ? '#f59e0b' : 'var(--brand-500)' }} />
          </div>
        </div>
      )}
      {budgets.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Budget by Phase</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Phase','Budgeted','Actual','Variance'].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {budgets.map((b: any) => {
                const v = Number(b.budgetAmount) - Number(b.actualAmount);
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{b.phase ?? b.category ?? '—'}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--text-secondary)' }}>৳{Number(b.budgetAmount).toLocaleString()}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--text-secondary)' }}>৳{Number(b.actualAmount).toLocaleString()}</td>
                    <td className="px-4 py-2 font-semibold" style={{ color: v >= 0 ? '#16a34a' : '#dc2626' }}>{v >= 0 ? '+' : ''}৳{v.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Actual spend is updated automatically when vendor invoices are paid. <Link href="/dashboard/invoices" className="underline" style={{ color: 'var(--brand-500)' }}>View Invoices →</Link>
      </p>
    </div>
  );
}

type Tab = 'tasks' | 'daily-logs' | 'milestones' | 'issues' | 'defects' | 'budget';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', dueDate: '', assignedTo: '', progressPct: '0', status: 'todo' });
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().split('T')[0], workDone: '', progressPct: '0', blockers: '', workersCount: '0', weather: '' });

  const { data: projectData, isLoading: pLoading } = useProject(id);
  const { data: tasksData, isLoading: tLoading } = useTasks(id);
  const { data: logsData, isLoading: lLoading } = useDailyLogs(id);
  const { options: userOptions, isLoading: uLoading } = useUserOptions();

  const createTask = useCreateTask(id);
  const deleteTask = useDeleteTask(id);
  const createLog = useCreateDailyLog(id);
  const { data: milestonesData, isLoading: mLoading } = useMilestones(id);
  const createMilestone = useCreateMilestone(id);
  const updateMilestone = useUpdateMilestone(id);
  const { data: issuesData, isLoading: iLoading } = useIssues(id);
  const createIssue = useCreateIssue(id);
  const updateIssue = useUpdateIssue(id);
  const { data: defectsData, isLoading: dLoading } = useDefects(id);
  const createDefect = useCreateDefect(id);
  const updateDefect = useUpdateDefect(id);
  const deleteDefect = useDeleteDefect(id);

  const [milestoneForm, setMilestoneForm] = useState({ name: '', dueDate: '', description: '' });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: '', description: '', priority: 'medium' });
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [defectForm, setDefectForm] = useState({ title: '', description: '', location: '', severity: 'medium', assignedTo: '', dueDate: '' });
  const [showDefectForm, setShowDefectForm] = useState(false);

  // updateTask is called dynamically with editingTask.id
  const qc = useQueryClient();
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: any }) => apiClient.updateTask(id, taskId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', id, 'tasks'] }),
  });

  const project = projectData?.data;
  const tasks = (tasksData?.data as any) ?? [];
  const logs = (logsData?.data as any) ?? [];
  const milestones = (milestonesData?.data as any) ?? [];
  const issues = (issuesData?.data as any) ?? [];
  const defects = (defectsData?.data as any[]) ?? [];
  const openDefects = defects.filter((d: any) => d.status === 'open' || d.status === 'in_progress').length;

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...taskForm, progressPct: Number(taskForm.progressPct), assignedTo: taskForm.assignedTo || undefined };
    if (editingTask) {
      await updateTaskMutation.mutateAsync({ taskId: editingTask.id, body: payload });
      setEditingTask(null);
    } else {
      await createTask.mutateAsync(payload as any);
    }
    setShowTaskForm(false);
    setTaskForm({ title: '', priority: 'medium', dueDate: '', assignedTo: '', progressPct: '0', status: 'todo' });
  };

  const startEdit = (task: any) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, priority: task.priority, dueDate: task.dueDate ?? '', assignedTo: task.assignedTo ?? '', progressPct: String(task.progressPct), status: task.status });
    setShowTaskForm(true);
  };

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
      <div className="flex gap-1 p-1 rounded-lg w-fit overflow-x-auto" style={{ background: 'var(--bg-muted)' }}>
        {(['tasks', 'daily-logs', 'milestones', 'issues', 'defects', 'budget'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap"
            style={{ background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
            {t.replace('-', ' ')}
            {t === 'issues' && issues.filter((i: any) => i.status === 'open').length > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#ef444420', color: '#ef4444' }}>
                {issues.filter((i: any) => i.status === 'open').length}
              </span>
            )}
            {t === 'defects' && openDefects > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                {openDefects}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quick links to sub-pages */}
      <div className="flex gap-2 flex-wrap">
        <Link href={`/dashboard/projects/${id}/risks`} className="text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 hover:bg-(--bg-muted) transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <span>⚠️</span> Risk Register
        </Link>
        <Link href={`/dashboard/projects/${id}/subcontracts`} className="text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 hover:bg-(--bg-muted) transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <span>📄</span> Subcontracts
        </Link>
      </div>

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2" onClick={() => { setEditingTask(null); setTaskForm({ title: '', priority: 'medium', dueDate: '', assignedTo: '', progressPct: '0', status: 'todo' }); setShowTaskForm(v => !v); }}>
              <Plus size={16} />{showTaskForm && !editingTask ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          {showTaskForm && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{editingTask ? 'Edit Task' : 'New Task'}</h3>
              <form onSubmit={handleTaskSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input-base sm:col-span-2" placeholder="Task title *" required value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} />
                <Select
                  options={PRIORITY_OPTIONS}
                  value={taskForm.priority}
                  onChange={v => setTaskForm(p => ({ ...p, priority: v }))}
                  placeholder="Priority"
                  label="Priority"
                  searchable={false}
                />
                <Select
                  options={STATUS_OPTIONS.task}
                  value={taskForm.status}
                  onChange={v => setTaskForm(p => ({ ...p, status: v }))}
                  placeholder="Status"
                  label="Status"
                  searchable={false}
                />
                <Select
                  options={userOptions}
                  value={taskForm.assignedTo}
                  onChange={v => setTaskForm(p => ({ ...p, assignedTo: v }))}
                  placeholder="Unassigned"
                  label="Assign To"
                  loading={uLoading}
                  clearable
                />
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
                  <input className="input-base" type="date" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Progress: {taskForm.progressPct}%</label>
                  <input className="w-full" type="range" min="0" max="100" value={taskForm.progressPct} onChange={e => setTaskForm(p => ({ ...p, progressPct: e.target.value }))} />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={createTask.isPending || updateTaskMutation.isPending} className="btn-primary">
                    {(createTask.isPending || updateTaskMutation.isPending) ? 'Saving…' : editingTask ? 'Update' : 'Add Task'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => { setShowTaskForm(false); setEditingTask(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <DataTable data={tasks} isLoading={tLoading} emptyIcon={<ClipboardList size={36} />} emptyText="No tasks yet."
            columns={[
              { key: 'wbs', label: 'WBS', render: (r: any) => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{r.wbsCode ?? '—'}</span> },
              { key: 'title', label: 'Task', render: (r: any) => (
                <span className="font-medium" style={{ color: 'var(--text-primary)', paddingLeft: r.parentTaskId ? '1rem' : 0 }}>
                  {r.parentTaskId ? '↳ ' : ''}{r.title}
                </span>
              )},
              { key: 'assignedTo', label: 'Assigned To', render: (r: any) => {
                const u = userOptions.find(o => o.value === r.assignedTo);
                return <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u?.label ?? (r.assignedTo ? '—' : '—')}</span>;
              }},
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
              { key: 'actions', label: '', render: (r: any) => (
                <div className="flex gap-1">
                  <button onClick={() => startEdit(r)} className="p-1.5 rounded hover:bg-(--bg-muted) transition-colors" style={{ color: 'var(--text-muted)' }}><Edit2 size={13} /></button>
                  <button onClick={() => deleteTask.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}><Trash2 size={13} /></button>
                </div>
              )},
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
              <form onSubmit={async e => {
                e.preventDefault();
                await createLog.mutateAsync({ ...logForm, progressPct: Number(logForm.progressPct), workersCount: Number(logForm.workersCount) } as any);
                setShowLogForm(false);
                setLogForm({ date: new Date().toISOString().split('T')[0], workDone: '', progressPct: '0', blockers: '', workersCount: '0', weather: '' });
              }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input-base" type="date" required value={logForm.date} onChange={e => setLogForm(p => ({ ...p, date: e.target.value }))} />
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Progress today: {logForm.progressPct}%</label>
                  <input className="w-full" type="range" min="0" max="100" value={logForm.progressPct} onChange={e => setLogForm(p => ({ ...p, progressPct: e.target.value }))} />
                </div>
                <textarea className="input-base sm:col-span-2" rows={3} placeholder="Work done today *" required value={logForm.workDone} onChange={e => setLogForm(p => ({ ...p, workDone: e.target.value }))} />
                <input className="input-base" placeholder="Blockers (if any)" value={logForm.blockers} onChange={e => setLogForm(p => ({ ...p, blockers: e.target.value }))} />
                <input className="input-base" type="number" placeholder="Workers on site" value={logForm.workersCount} onChange={e => setLogForm(p => ({ ...p, workersCount: e.target.value }))} />
                <Select
                  options={[
                    { value: '', label: 'Weather (optional)' },
                    { value: 'Sunny', label: '☀️ Sunny' },
                    { value: 'Cloudy', label: '☁️ Cloudy' },
                    { value: 'Rainy', label: '🌧️ Rainy' },
                    { value: 'Stormy', label: '⛈️ Stormy' },
                    { value: 'Foggy', label: '🌫️ Foggy' },
                  ]}
                  value={logForm.weather}
                  onChange={v => setLogForm(p => ({ ...p, weather: v }))}
                  placeholder="Weather (optional)"
                  clearable
                  searchable={false}
                />
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={createLog.isPending} className="btn-primary">{createLog.isPending ? 'Submitting…' : 'Submit Log'}</button>
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
              { key: 'weather', label: 'Weather', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.weather || '—'}</span> },
              { key: 'blockers', label: 'Blockers', render: (r: any) => <span className="text-xs" style={{ color: r.blockers ? '#dc2626' : 'var(--text-muted)' }}>{r.blockers || 'None'}</span> },
            ]}
          />
        </div>
      )}

      {/* Defects / Punch List Tab */}
      {tab === 'defects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {[
                { label: 'Open', count: defects.filter((d: any) => d.status === 'open').length, color: '#ef4444' },
                { label: 'In Progress', count: defects.filter((d: any) => d.status === 'in_progress').length, color: '#f59e0b' },
                { label: 'Resolved', count: defects.filter((d: any) => d.status === 'resolved').length, color: '#16a34a' },
              ].map(s => (
                <div key={s.label} className="text-xs px-2.5 py-1 rounded-full" style={{ background: s.color + '15', color: s.color }}>
                  {s.label}: {s.count}
                </div>
              ))}
            </div>
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowDefectForm(v => !v)}>
              <Plus size={16} />Log Defect
            </button>
          </div>

          {showDefectForm && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>New Defect / Punch Item</h3>
              <form onSubmit={async e => {
                e.preventDefault();
                await createDefect.mutateAsync(defectForm as any);
                setShowDefectForm(false);
                setDefectForm({ title: '', description: '', location: '', severity: 'medium', assignedTo: '', dueDate: '' });
              }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input-base sm:col-span-2" placeholder="Defect title *" required value={defectForm.title} onChange={e => setDefectForm(p => ({ ...p, title: e.target.value }))} />
                <Select options={PRIORITY_OPTIONS} value={defectForm.severity} onChange={v => setDefectForm(p => ({ ...p, severity: v }))} label="Severity" searchable={false} />
                <input className="input-base" placeholder="Location (e.g. Floor 3, Room 301)" value={defectForm.location} onChange={e => setDefectForm(p => ({ ...p, location: e.target.value }))} />
                <Select options={userOptions} value={defectForm.assignedTo} onChange={v => setDefectForm(p => ({ ...p, assignedTo: v }))} placeholder="Assign to" label="Assigned To" loading={uLoading} clearable />
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
                  <input className="input-base" type="date" value={defectForm.dueDate} onChange={e => setDefectForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <textarea className="input-base sm:col-span-2" rows={2} placeholder="Description" value={defectForm.description} onChange={e => setDefectForm(p => ({ ...p, description: e.target.value }))} />
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={createDefect.isPending} className="btn-primary">{createDefect.isPending ? 'Saving…' : 'Log Defect'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowDefectForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <DataTable data={defects} isLoading={dLoading} emptyIcon={<AlertTriangle size={36} />} emptyText="No defects logged. Great work!"
            columns={[
              { key: 'title', label: 'Defect', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span> },
              { key: 'location', label: 'Location', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.location ?? '—'}</span> },
              { key: 'severity', label: 'Severity', render: (r: any) => <StatusBadge status={r.severity} /> },
              { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
              { key: 'assignedTo', label: 'Assigned', render: (r: any) => {
                const u = userOptions.find(o => o.value === r.assignedTo);
                return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u?.label ?? '—'}</span>;
              }},
              { key: 'dueDate', label: 'Due', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}</span> },
              { key: 'actions', label: '', render: (r: any) => (
                <div className="flex gap-1">
                  {r.status === 'open' && <button onClick={() => updateDefect.mutate({ did: r.id, body: { status: 'in_progress' } })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>Start</button>}
                  {(r.status === 'open' || r.status === 'in_progress') && <button onClick={() => updateDefect.mutate({ did: r.id, body: { status: 'resolved' } })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Resolve</button>}
                  <button onClick={() => deleteDefect.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={13} /></button>
                </div>
              )},
            ]}
          />
        </div>
      )}

      {/* Budget Tab */}
      {tab === 'budget' && (
        <BudgetTab projectId={id} project={project} />
      )}

      {/* Milestones Tab */}
      {tab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowMilestoneForm(v => !v)}><Plus size={16} />Add Milestone</button>
          </div>
          {showMilestoneForm && (
            <div className="card p-4">
              <form onSubmit={async e => { e.preventDefault(); await createMilestone.mutateAsync(milestoneForm as any); setShowMilestoneForm(false); setMilestoneForm({ name: '', dueDate: '', description: '' }); }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input className="input-base sm:col-span-2" placeholder="Milestone name *" required value={milestoneForm.name} onChange={e => setMilestoneForm(p => ({ ...p, name: e.target.value }))} />
                <input className="input-base" type="date" required value={milestoneForm.dueDate} onChange={e => setMilestoneForm(p => ({ ...p, dueDate: e.target.value }))} />
                <input className="input-base sm:col-span-3" placeholder="Description" value={milestoneForm.description} onChange={e => setMilestoneForm(p => ({ ...p, description: e.target.value }))} />
                <div className="sm:col-span-3 flex gap-2">
                  <button type="submit" disabled={createMilestone.isPending} className="btn-primary">{createMilestone.isPending ? 'Adding…' : 'Add'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowMilestoneForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
          <DataTable data={milestones} isLoading={mLoading} emptyIcon={<Flag size={36} />} emptyText="No milestones yet."
            columns={[
              { key: 'name', label: 'Milestone', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
              { key: 'dueDate', label: 'Due Date', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}</span> },
              { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
              { key: 'description', label: 'Description', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.description || '—'}</span> },
              { key: 'actions', label: '', render: (r: any) => r.status !== 'completed' ? (
                <button onClick={() => updateMilestone.mutate({ mid: r.id, body: { status: 'completed' } })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Complete</button>
              ) : null },
            ]}
          />
        </div>
      )}

      {/* Issues Tab */}
      {tab === 'issues' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowIssueForm(v => !v)}><Plus size={16} />Report Issue</button>
          </div>
          {showIssueForm && (
            <div className="card p-4">
              <form onSubmit={async e => { e.preventDefault(); await createIssue.mutateAsync(issueForm as any); setShowIssueForm(false); setIssueForm({ title: '', description: '', priority: 'medium' }); }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input-base sm:col-span-2" placeholder="Issue title *" required value={issueForm.title} onChange={e => setIssueForm(p => ({ ...p, title: e.target.value }))} />
                <Select options={PRIORITY_OPTIONS} value={issueForm.priority} onChange={v => setIssueForm(p => ({ ...p, priority: v }))} placeholder="Priority" label="Priority" searchable={false} />
                <textarea className="input-base sm:col-span-2" rows={2} placeholder="Description" value={issueForm.description} onChange={e => setIssueForm(p => ({ ...p, description: e.target.value }))} />
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={createIssue.isPending} className="btn-primary">{createIssue.isPending ? 'Reporting…' : 'Report'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowIssueForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
          <DataTable data={issues} isLoading={iLoading} emptyIcon={<AlertTriangle size={36} />} emptyText="No issues reported."
            columns={[
              { key: 'title', label: 'Issue', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span> },
              { key: 'priority', label: 'Priority', render: (r: any) => <StatusBadge status={r.priority} /> },
              { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
              { key: 'description', label: 'Description', render: (r: any) => <span className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{r.description || '—'}</span> },
              { key: 'actions', label: '', render: (r: any) => r.status === 'open' ? (
                <button onClick={() => updateIssue.mutate({ iid: r.id, body: { status: 'resolved' } })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Resolve</button>
              ) : null },
            ]}
          />
        </div>
      )}
    </div>
  );
}
