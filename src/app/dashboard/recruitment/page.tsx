'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const STAGES = ['applied','screening','interview','offered','hired','rejected'];

function JobRow({ job }: { job: any }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();
  const { data: appData } = useQuery({ queryKey: ['applicants', job.id], queryFn: () => extendedApiClient.getApplicants(job.id), enabled: expanded });
  const moveStage = useMutation({ mutationFn: ({ id, stage }: { id: string; stage: string }) => extendedApiClient.moveApplicantStage(id, stage), onSuccess: () => qc.invalidateQueries({ queryKey: ['applicants', job.id] }) });
  const applicants = (appData?.data as any) ?? [];

  return (
    <>
      <tr className="transition-colors hover:bg-(--bg-subtle)" style={{ borderBottom: '1px solid var(--border)' }}>
        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{job.title}</td>
        <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}</td>
        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{job.vacancies} vacancy</td>
        <td className="px-4 py-3">
          <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded hover:bg-(--bg-muted) transition-colors" style={{ color: 'var(--text-muted)' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <td colSpan={5} className="px-4 py-3" style={{ background: 'var(--bg-subtle)' }}>
            {applicants.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No applicants yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead><tr>{['Name','Email','Stage','Action'].map(h => <th key={h} className="text-left py-1 pr-4 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {applicants.map((a: any) => (
                    <tr key={a.id}>
                      <td className="py-1 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>{a.name}</td>
                      <td className="py-1 pr-4" style={{ color: 'var(--text-muted)' }}>{a.email}</td>
                      <td className="py-1 pr-4"><StatusBadge status={a.stage} /></td>
                      <td className="py-1">
                        <select className="text-xs border rounded px-1 py-0.5" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                          value={a.stage} onChange={e => moveStage.mutate({ id: a.id, stage: e.target.value })}>
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function RecruitmentPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', vacancies: '1', deadline: '' });

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['jobs'], queryFn: extendedApiClient.getJobs });
  const create = useMutation({ mutationFn: extendedApiClient.createJob, onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); setShowForm(false); } });

  const jobs = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Recruitment" subtitle="Job postings & applicant tracking"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Post Job</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, vacancies: Number(form.vacancies) }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Job title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Vacancies" value={form.vacancies} onChange={e => setForm(p => ({ ...p, vacancies: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Application deadline" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            <textarea className="input-base sm:col-span-2" rows={3} placeholder="Job description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Posting…' : 'Post Job'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="card p-8 text-center"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} /></div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center"><Users size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} /><p style={{ color: 'var(--text-muted)' }}>No job postings yet.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{['Title','Status','Deadline','Vacancies',''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>)}</tr></thead>
            <tbody>{jobs.map((job: any) => <JobRow key={job.id} job={job} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
