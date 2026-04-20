'use client';

import { useState } from 'react';
import { useEmployees, useCreateEmployee, useDeleteEmployee } from '@/hooks/use-employees';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { HardHat, Plus, Search, Trash2 } from 'lucide-react';
import type { Employee } from '@/lib/api';

const BLANK = { firstName: '', lastName: '', email: '', phone: '', employeeCode: '', designation: '', employmentType: 'full_time', basicSalary: '', joinDate: '' };

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  const { data, isLoading } = useEmployees({ search: search || undefined });
  const create = useCreateEmployee();
  const del = useDeleteEmployee();

  const employees: Employee[] = data?.data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ ...form, basicSalary: Number(form.basicSalary) } as any);
    setShowForm(false); setForm(BLANK);
  };

  const f = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Employees" subtitle="Manage your workforce"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}><Plus size={16} />Add Employee</button>} />

      {showForm && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Employee</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="First name *" required value={form.firstName} onChange={f('firstName')} />
            <input className="input-base" placeholder="Last name *" required value={form.lastName} onChange={f('lastName')} />
            <input className="input-base" type="email" placeholder="Email *" required value={form.email} onChange={f('email')} />
            <input className="input-base" placeholder="Phone" value={form.phone} onChange={f('phone')} />
            <input className="input-base" placeholder="Employee code *" required value={form.employeeCode} onChange={f('employeeCode')} />
            <input className="input-base" placeholder="Designation" value={form.designation} onChange={f('designation')} />
            <select className="input-base" value={form.employmentType} onChange={f('employmentType')}>
              {['full_time','part_time','contract','daily_labor'].map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
            </select>
            <input className="input-base" type="number" placeholder="Basic salary (BDT)" value={form.basicSalary} onChange={f('basicSalary')} />
            <input className="input-base" type="date" placeholder="Join date *" required value={form.joinDate} onChange={f('joinDate')} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-base pl-9" placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <DataTable
        data={employees as any}
        isLoading={isLoading}
        emptyIcon={<HardHat size={40} />}
        emptyText="No employees found."
        columns={[
          { key: 'name', label: 'Employee', render: (r: any) => (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br from-purple-600 to-purple-800">
                {((r.firstName?.[0] ?? '') + (r.lastName?.[0] ?? '')).toUpperCase()}
              </div>
              <div>
                <a href={`/dashboard/employees/${r.id}`} className="font-medium hover:underline" style={{ color: 'var(--brand-500)' }}>{r.firstName} {r.lastName}</a>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.email}</p>
              </div>
            </div>
          )},
          { key: 'employeeCode', label: 'Code', render: (r: any) => <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{r.employeeCode}</span> },
          { key: 'designation', label: 'Designation', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.designation ?? '—'}</span> },
          { key: 'employmentType', label: 'Type', render: (r: any) => <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{r.employmentType?.replace(/_/g,' ')}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'basicSalary', label: 'Salary', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>৳{Number(r.basicSalary).toLocaleString()}</span> },
          { key: 'joinDate', label: 'Joined', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.joinDate).toLocaleDateString()}</span> },
          { key: 'actions', label: '', render: (r: any) => (
            <button onClick={() => del.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
          )},
        ]}
      />
    </div>
  );
}
