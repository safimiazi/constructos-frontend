'use client';

import { useState } from 'react';
import { useLeaves, useApproveLeave, useRejectLeave } from '@/hooks/use-employees';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { Briefcase, Plus, Check, X } from 'lucide-react';
import { STATUS_OPTIONS, LEAVE_TYPE_OPTIONS, useEmployeeOptions } from '@/hooks/use-select-options';
import { apiClient } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function LeavesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', leaveType: 'casual', startDate: '', endDate: '', totalDays: '', reason: '' });

  const { data, isLoading } = useLeaves({ status: statusFilter || undefined });
  const { options: empOptions, isLoading: empLoading } = useEmployeeOptions();
  const leaves = (data?.data as any) ?? [];

  const approve = useApproveLeave();
  const reject = useRejectLeave();
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: (body: any) => apiClient.createLeave(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leaves'] }); setShowForm(false); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Leave Requests" subtitle="Manage employee leave"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Apply Leave</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, totalDays: Number(form.totalDays) }); }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              options={empOptions}
              value={form.employeeId}
              onChange={v => setForm(p => ({ ...p, employeeId: v }))}
              placeholder="Select employee *"
              loading={empLoading}
            />
            <Select
              options={LEAVE_TYPE_OPTIONS}
              value={form.leaveType}
              onChange={v => setForm(p => ({ ...p, leaveType: v }))}
              placeholder="Leave type"
            />
            <input className="input-base" type="date" required value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            <input className="input-base" type="date" required value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Total days *" required value={form.totalDays} onChange={e => setForm(p => ({ ...p, totalDays: e.target.value }))} />
            <input className="input-base" placeholder="Reason *" required value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Submitting…' : 'Submit'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="sm:w-48">
        <Select
          options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS.leave]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Status"
          searchable={false}
        />
      </div>

      <DataTable data={leaves} isLoading={isLoading} emptyIcon={<Briefcase size={40} />} emptyText="No leave requests."
        columns={[
          { key: 'employeeId', label: 'Employee', render: (r: any) => {
            const emp = empOptions.find(e => e.value === r.employeeId);
            return <span style={{ color: 'var(--text-secondary)' }}>{emp?.label ?? r.employeeId?.slice(0,8)}</span>;
          }},
          { key: 'leaveType', label: 'Type', render: (r: any) => <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{r.leaveType}</span> },
          { key: 'startDate', label: 'From', render: (r: any) => <span className="text-xs">{new Date(r.startDate).toLocaleDateString()}</span> },
          { key: 'endDate', label: 'To', render: (r: any) => <span className="text-xs">{new Date(r.endDate).toLocaleDateString()}</span> },
          { key: 'totalDays', label: 'Days', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.totalDays}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'actions', label: '', render: (r: any) => r.status === 'pending' ? (
            <div className="flex gap-1">
              <button onClick={() => approve.mutate(r.id)} className="p-1.5 rounded hover:bg-green-50" style={{ color: '#16a34a' }}><Check size={14} /></button>
              <button onClick={() => reject.mutate({ id: r.id, reason: 'Rejected by manager' })} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><X size={14} /></button>
            </div>
          ) : null },
        ]}
      />
    </div>
  );
}
