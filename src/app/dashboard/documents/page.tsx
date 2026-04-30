'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedApiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { FileText, Plus, Search, Check, Trash2 } from 'lucide-react';
import { useProjectOptions } from '@/hooks/use-select-options';

const DOC_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', fileUrl: '', folder: '', description: '', projectId: '' });

  const qc = useQueryClient();
  const { options: projectOptions, isLoading: pLoading } = useProjectOptions();
  const { data, isLoading } = useQuery({ queryKey: ['documents', { search, projectId }], queryFn: () => extendedApiClient.getDocuments({ search: search || undefined, projectId: projectId || undefined }) });
  const { data: foldersData } = useQuery({ queryKey: ['doc-folders'], queryFn: extendedApiClient.getDocumentFolders });

  const create = useMutation({ mutationFn: extendedApiClient.createDocument, onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); setShowForm(false); } });
  const approve = useMutation({ mutationFn: extendedApiClient.approveDocument, onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });
  const del = useMutation({ mutationFn: extendedApiClient.deleteDocument, onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });

  const documents = data?.data?.data ?? [];
  const folders = (foldersData?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Documents" subtitle="Project documents & files"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Upload Document</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, projectId: form.projectId || undefined }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base sm:col-span-2" placeholder="Document name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base sm:col-span-2" placeholder="File URL *" required value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} />
            <Select options={projectOptions} value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} placeholder="Link to project (optional)" loading={pLoading} clearable label="Project" />
            <input className="input-base" placeholder="Folder (e.g. drawings, contracts)" value={form.folder} onChange={e => setForm(p => ({ ...p, folder: e.target.value }))} />
            <input className="input-base sm:col-span-2" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-base pl-9" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="w-56">
          <Select options={[{ value: '', label: 'All Projects' }, ...projectOptions]} value={projectId} onChange={setProjectId} placeholder="All Projects" loading={pLoading} clearable />
        </div>
      </div>

      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {folders.map((f: any) => (
            <span key={f.folder} className="text-xs px-3 py-1 rounded-full cursor-pointer" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              📁 {f.folder}
            </span>
          ))}
        </div>
      )}

      <DataTable data={documents as any} isLoading={isLoading} emptyIcon={<FileText size={40} />} emptyText="No documents found."
        columns={[
          { key: 'name', label: 'Document', render: (r: any) => (
            <div>
              <a href={r.fileUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color: 'var(--brand-500)' }}>{r.name}</a>
              {r.description && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.description}</p>}
            </div>
          )},
          { key: 'folder', label: 'Folder', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.folder ?? '—'}</span> },
          { key: 'version', label: 'Version', render: (r: any) => <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>v{r.version}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'createdAt', label: 'Uploaded', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              {r.status === 'draft' && <button onClick={() => approve.mutate(r.id)} className="p-1.5 rounded hover:bg-green-50" style={{ color: '#16a34a' }}><Check size={14} /></button>}
              <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
            </div>
          )},
        ]}
      />
    </div>
  );
}
