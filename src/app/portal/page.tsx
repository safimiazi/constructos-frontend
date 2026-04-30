'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { FolderKanban, TrendingUp, FileText, LogOut } from 'lucide-react';

export default function ClientPortalPage() {
  const { user, logout } = useAuth();
  const [activeProject, setActiveProject] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['portal-projects'],
    queryFn: () => apiClient.getProjects({ limit: 50 }),
    enabled: !!user,
  });

  const projects = projectsData?.data?.data ?? [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-subtle)' }}>
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto text-white mb-4" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))' }}>C</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Client Portal</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Please log in to view your projects.</p>
          <a href="/login" className="btn-primary w-full block text-center">Login</a>
        </div>
      </div>
    );
  }

  const selected = projects.find((p: any) => p.id === activeProject);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-subtle)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-6 py-3 flex items-center justify-between" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))' }}>C</div>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Client Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.firstName} {user.lastName}</span>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}><LogOut size={14} />Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Projects</h1>

        {/* Project selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p: any) => {
            const colors: Record<string, string> = { active: '#22c55e', planning: '#6b7280', on_hold: '#f59e0b', completed: '#3b82f6' };
            const color = colors[p.status] ?? '#6b7280';
            return (
              <button key={p.id} onClick={() => setActiveProject(p.id)}
                className="card p-5 text-left transition-all hover:shadow-md"
                style={{ borderColor: activeProject === p.id ? 'var(--brand-500)' : 'var(--border)', borderWidth: activeProject === p.id ? 2 : 1 }}>
                <div className="flex items-start justify-between mb-3">
                  <FolderKanban size={20} style={{ color: 'var(--brand-500)' }} />
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: color + '20', color }}>{p.status.replace('_', ' ')}</span>
                </div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                {p.location && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>📍 {p.location}</p>}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span className="font-semibold" style={{ color: 'var(--brand-500)' }}>{p.completionPercentage}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${p.completionPercentage}%`, background: 'var(--brand-500)' }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Project detail */}
        {selected && (
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{selected.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Budget', value: `৳${Number(selected.budgetAmount).toLocaleString()}`, icon: TrendingUp, color: '#9333ea' },
                  { label: 'Progress', value: `${selected.completionPercentage}%`, icon: FolderKanban, color: '#3b82f6' },
                  { label: 'Start Date', value: selected.startDate ? new Date(selected.startDate).toLocaleDateString() : '—', icon: FileText, color: '#16a34a' },
                  { label: 'End Date', value: selected.endDate ? new Date(selected.endDate).toLocaleDateString() : '—', icon: FileText, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-muted)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon size={14} style={{ color: s.color }} />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                    <p className="font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Overall Progress</p>
              <div className="h-4 rounded-full" style={{ background: 'var(--border)' }}>
                <div className="h-4 rounded-full transition-all" style={{ width: `${selected.completionPercentage}%`, background: 'linear-gradient(90deg, var(--brand-600), var(--brand-400))' }} />
              </div>
              <p className="text-xs mt-2 text-right font-semibold" style={{ color: 'var(--brand-500)' }}>{selected.completionPercentage}% Complete</p>
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <div className="card p-12 text-center">
            <FolderKanban size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No projects assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
