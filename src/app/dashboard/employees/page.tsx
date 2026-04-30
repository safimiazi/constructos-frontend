'use client';

import { useState } from 'react';
import { useEmployees, useCreateEmployee, useDeleteEmployee } from '@/hooks/use-employees';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { HardHat, Plus, Search, Trash2 } from 'lucide-react';
import { EMPLOYMENT_TYPE_OPTIONS, STATUS_OPTIONS, useDepartmentOptions } from '@/hooks/use-select-options';
import type { Employee } from '@/lib/api';

const BLANK = { firstName: '', lastName: '', email: '', phone: '', employeeCode: '', designation: '', employmentType: 'full_time', basicSalary: '', joinDate: '', departmentId: '' };

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  const { data, isLoading } = useEmployees({ search: search || undefined });
  const create = useCreateEmployee();
  const del = useDeleteEmployee();
  const { options: deptOptions, isLoading: deptLoading } = useDepartmentOptions();

  const employees: Employee[] = data?.data?.data ?? [];
  const filtered = statusFilter ? employees.filter(e => e.status === statusFilter) : employees;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ ...form, basicSalary: Number(form.basicSalary) } as any);
    setShowForm(false); setForm(BLANK);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Employees" subtitle="Manage your workforce"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}><Plus size={16} />Add Employee</button>} />

      {showForm && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Employee</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="First name *" required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
            <input className="input-base" placeholder="Last name *" required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
            <input className="input-base" type="email" placeholder="Email *" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input className="input-base" placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <input className="input-base" placeholder="Employee code *" required value={form.employeeCode} onChange={e => setForm(p => ({ ...p, employeeCode: e.target.value }))} />
            <input className="input-base" placeholder="Designation" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
            <Select
              options={EMPLOYMENT_TYPE_OPTIONS}
              value={form.employmentType}
              onChange={v => setForm(p => ({ ...p, employmentType: v }))}
              placeholder="Employment type"
            />
            <Select
              options={deptOptions}
              value={form.departmentId}
              onChange={v => setForm(p => ({ ...p, departmentId: v }))}
              placeholder="Department"
              loading={deptLoading}
              clearable
            />
            <input className="input-base" type="number" placeholder="Basic salary (BDT)" value={form.basicSalary} onChange={e => setForm(p => ({ ...p, basicSalary: e.target.value }))} />
            <input className="input-base" type="date" placeholder="Join date *" required value={form.joinDate} onChange={e => setForm(p => ({ ...p, joinDate: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-base pl-9" placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="sm:w-48">
          <Select
            options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS.employee]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Status"
            searchable={false}
          />
        </div>
      </div>

      <DataTable
        data={filtered as any}
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
