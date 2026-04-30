'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV5 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import { ClipboardList, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useProjectOptions } from '@/hooks/use-select-options';

const DEFAULT_ITEMS = [
  'PPE worn by all workers', 'Site barriers in place', 'Emergency exits clear',
  'Fire extinguisher accessible', 'First aid kit available', 'Hazard signs posted',
  'Equipment inspected', 'Work area clean', 'Supervisor present', 'Safety briefing done',
];

function ChecklistRow({ checklist }: { checklist: any }) {
  const [expanded, setExpanded] = useState(false);
  const [responses, setResponses] = useState<Record<string, boolean>>({});
  const qc = useQueryClient();
  const submit = useMutation({ mutationFn: (data: any) => apiV5.submitChecklist(checklist.id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['checklists'] }) });

  return (
    <>
      <tr className="hover:bg-(--bg-subtle) transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{checklist.title}</td>
        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(checklist.date).toLocaleDateString()}</td>
        <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: checklist.status === 'completed' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: checklist.status === 'completed' ? '#16a34a' : '#d97706' }}>{checklist.status}</span></td>
        <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--brand-500)' }}>{checklist.score != null ? `${checklist.score}%` : '—'}</td>
        <td className="px-4 py-3">
          <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded hover:bg-(--bg-muted)" style={{ color: 'var(--text-muted)' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
      </tr>
      {expanded && checklist.status !== 'completed' && (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <td colSpan={5} className="px-4 py-4" style={{ background: 'var(--bg-subtle)' }}>
            <div className="space-y-2 mb-3">
              {DEFAULT_ITEMS.map(item => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!responses[item]} onChange={e => setResponses(p => ({ ...p, [item]: e.target.checked }))} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </label>
              ))}
            </div>
            <button onClick={() => submit.mutate({ responses: DEFAULT_ITEMS.map(q => ({ question: q, answer: !!responses[q] })) })} disabled={submit.isPending} className="btn-primary text-sm">
              {submit.isPending ? 'Submitting…' : 'Submit Checklist'}
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ChecklistsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ projectId: '', title: '', date: new Date().toISOString().split('T')[0] });
  const qc = useQueryClient();
  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const { data, isLoading } = useQuery({ queryKey: ['checklists'], queryFn: () => apiV5.getChecklists() });
  const create = useMutation({ mutationFn: apiV5.createChecklist, onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklists'] }); setShowForm(false); } });
  const checklists = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Safety Checklists" subtitle="Mobile safety walkthrough forms"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />New Checklist</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, items: DEFAULT_ITEMS.map(q => ({ question: q, answer: null })) }); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select options={projectOptions} value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} placeholder="Select project *" loading={pLoading} label="Project" />
            <input className="input-base" placeholder="Checklist title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date</label>
              <input className="input-base" type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Creating…' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {isLoading ? (
        <div className="card p-8 text-center"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} /></div>
      ) : checklists.length === 0 ? (
        <div className="card p-12 text-center"><ClipboardList size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} /><p style={{ color: 'var(--text-muted)' }}>No checklists yet.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{['Title','Date','Status','Score',''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>)}</tr></thead>
            <tbody>{checklists.map((c: any) => <ChecklistRow key={c.id} checklist={c} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
