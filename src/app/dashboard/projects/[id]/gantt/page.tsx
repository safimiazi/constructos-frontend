'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiV4 } from '@/lib/api';
import { useProject } from '@/hooks/use-projects';
import { ArrowLeft } from 'lucide-react';

function GanttBar({ task, minDate, totalDays }: { task: any; minDate: Date; totalDays: number }) {
  const start = task.startDate ? new Date(task.startDate) : minDate;
  const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + 7 * 86400000);
  const left = Math.max(0, (start.getTime() - minDate.getTime()) / 86400000 / totalDays * 100);
  const width = Math.max(1, (end.getTime() - start.getTime()) / 86400000 / totalDays * 100);
  const statusColors: Record<string, string> = { todo: '#6b7280', in_progress: '#3b82f6', done: '#22c55e', blocked: '#ef4444' };
  const color = statusColors[task.status] ?? '#9333ea';

  return (
    <div className="relative h-7 rounded" style={{ background: 'var(--bg-muted)' }}>
      <div className="absolute top-1 h-5 rounded flex items-center px-2 text-xs text-white font-medium truncate"
        style={{ left: `${left}%`, width: `${Math.max(width, 3)}%`, background: color, minWidth: 40 }}>
        {task.title}
      </div>
    </div>
  );
}

export default function GanttPage() {
  const { id } = useParams<{ id: string }>();
  const { data: projectData } = useProject(id);
  const { data: ganttData, isLoading } = useQuery({ queryKey: ['gantt', id], queryFn: () => apiV4.getGantt(id) });

  const project = projectData?.data;
  const tasks: any[] = ganttData?.data?.tasks ?? [];

  // Calculate date range
  const dates = tasks.flatMap(t => [t.startDate, t.dueDate].filter(Boolean).map((d: string) => new Date(d)));
  const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
  const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date(Date.now() + 30 * 86400000);
  const totalDays = Math.max(30, (maxDate.getTime() - minDate.getTime()) / 86400000);

  // Generate week headers
  const weeks: Date[] = [];
  const cur = new Date(minDate);
  while (cur <= maxDate) { weeks.push(new Date(cur)); cur.setDate(cur.getDate() + 7); }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/projects/${id}`} className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="page-title">{project?.name} — Gantt Chart</h1>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} /></div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--text-muted)' }}>No tasks with dates. Add start/due dates to tasks to see the Gantt chart.</div>
      ) : (
        <div className="card overflow-hidden">
          {/* Header — weeks */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
            <div className="w-48 shrink-0 px-3 py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Task</div>
            <div className="flex-1 relative h-8">
              {weeks.map((w, i) => (
                <div key={i} className="absolute top-0 h-full flex items-center px-1 text-xs" style={{ left: `${(w.getTime() - minDate.getTime()) / 86400000 / totalDays * 100}%`, color: 'var(--text-muted)', borderLeft: '1px solid var(--border)' }}>
                  {w.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {tasks.map((task: any) => (
              <div key={task.id} className="flex items-center hover:bg-(--bg-subtle) transition-colors">
                <div className="w-48 shrink-0 px-3 py-2">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                  <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{task.status?.replace('_', ' ')}</p>
                </div>
                <div className="flex-1 px-2 py-1.5">
                  <GanttBar task={task} minDate={minDate} totalDays={totalDays} />
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
            {[{ label: 'Todo', color: '#6b7280' }, { label: 'In Progress', color: '#3b82f6' }, { label: 'Done', color: '#22c55e' }, { label: 'Blocked', color: '#ef4444' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="w-3 h-3 rounded" style={{ background: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
