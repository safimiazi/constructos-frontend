'use client';

import { useState } from 'react';
import { useLeaves, useApproveLeave, useRejectLeave, useEmployees } from '@/hooks/use-employees';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Briefcase, Plus, Check, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function LeavesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', leaveType: 'casual', startDate: '', endDate: '', totalDays: '', reason: '' });

  const { data, isLoading } = useLeaves({ status: statusFilter || undefined });
  const { data: empData } = useEmployees();
  const employees = empData?.data?.data ?? [];
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
            <select className="input-base" required value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}>
              <option value="">Select employee *</option>
              {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
            <select className="input-base" value={form.leaveType} onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))}>
              {['sick','casual','annual','unpaid','maternity'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
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

      <select className="input-base w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">All Status</option>
        {['pending','approved','rejected','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <DataTable data={leaves} isLoading={isLoading} emptyIcon={<Briefcase size={40} />} emptyText="No leave requests."
        columns={[
          { key: 'employeeId', label: 'Employee', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.employeeId}</span> },
          { key: 'leaveType', label: 'Type', render: (r: any) => <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{r.leaveType}</span> },
          { key: 'startDate', label: 'From', render: (r: any) => <span className="text-xs">{new Date(r.startDate).toLocaleDateString()}</span> },
          { key: 'endDate', label: 'To', render: (r: any) => <span className="text-xs">{new Date(r.endDate).toLocaleDateString()}</span> },
          { key: 'totalDays', label: 'Days', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.totalDays}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'actions', label: '', render: (r: any) => r.status === 'pending' ? (
            <div className="flex gap-1">
              <button onClick={() => approve.mutate(r.id)} className="p-1.5 rounded hover:bg-green-50 transition-colors" style={{ color: '#16a34a' }}><Check size={14} /></button>
              <button onClick={() => reject.mutate({ id: r.id, reason: 'Rejected by manager' })} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}><X size={14} /></button>
            </div>
          ) : null },
        ]}
      />
    </div>
  );
}
