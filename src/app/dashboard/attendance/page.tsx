'use client';

import { useState } from 'react';
import { useAttendance, useEmployees } from '@/hooks/use-employees';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { CalendarDays } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [empId, setEmpId] = useState('');
  const [form, setForm] = useState({ employeeId: '', date: today, status: 'present', checkIn: '', checkOut: '', notes: '' });
  const [showForm, setShowForm] = useState(false);

  const { data: attData, isLoading } = useAttendance({ employeeId: empId || undefined, startDate, endDate });
  const { data: empData } = useEmployees();
  const employees = empData?.data?.data ?? [];
  const records = (attData?.data as any) ?? [];

  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: (body: any) => apiClient.createAttendance(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance'] }); setShowForm(false); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Attendance" subtitle="Track employee attendance"
        action={<button className="btn-primary" onClick={() => setShowForm(v => !v)}>+ Mark Attendance</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select className="input-base" required value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}>
              <option value="">Select employee *</option>
              {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
            <input className="input-base" type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            <select className="input-base" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {['present','absent','late','half_day','on_leave'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
            <input className="input-base" type="time" placeholder="Check in" value={form.checkIn} onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))} />
            <input className="input-base" type="time" placeholder="Check out" value={form.checkOut} onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))} />
            <input className="input-base" placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <select className="input-base w-52" value={empId} onChange={e => setEmpId(e.target.value)}>
          <option value="">All Employees</option>
          {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
        </select>
        <input className="input-base w-40" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input className="input-base w-40" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>

      <DataTable data={records} isLoading={isLoading} emptyIcon={<CalendarDays size={40} />} emptyText="No attendance records."
        columns={[
          { key: 'employeeId', label: 'Employee', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.employeeId}</span> },
          { key: 'date', label: 'Date', render: (r: any) => <span>{new Date(r.date).toLocaleDateString()}</span> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'checkIn', label: 'Check In', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</span> },
          { key: 'checkOut', label: 'Check Out', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</span> },
          { key: 'workingHours', label: 'Hours', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.workingHours}h</span> },
        ]}
      />
    </div>
  );
}
