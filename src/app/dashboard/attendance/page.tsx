'use client';

import { useState } from 'react';
import { useAttendance, useEmployees } from '@/hooks/use-employees';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { CalendarDays, LogIn, LogOut } from 'lucide-react';
import { apiClient, apiV3 } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEmployeeOptions } from '@/hooks/use-select-options';

const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'on_leave', label: 'On Leave' },
];

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [filterEmpId, setFilterEmpId] = useState('');
  const [clockEmpId, setClockEmpId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', date: today, status: 'present', checkIn: '', checkOut: '', notes: '' });

  const { data: attData, isLoading } = useAttendance({ employeeId: filterEmpId || undefined, startDate, endDate });
  const { options: empOptions, isLoading: empLoading } = useEmployeeOptions();
  const records = (attData?.data as any) ?? [];

  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: (body: any) => apiClient.createAttendance(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance'] }); setShowForm(false); },
  });
  const clockIn = useMutation({ mutationFn: ({ id }: { id: string }) => apiV3.clockIn(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }) });
  const clockOut = useMutation({ mutationFn: ({ id }: { id: string }) => apiV3.clockOut(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }) });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Attendance" subtitle="Track employee attendance"
        action={<button className="btn-primary" onClick={() => setShowForm(v => !v)}>+ Mark Attendance</button>} />

      {/* Quick Clock-In/Out */}
      <div className="card p-4">
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Quick Clock-In / Clock-Out</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-64">
            <Select options={empOptions} value={clockEmpId} onChange={setClockEmpId} placeholder="Select employee" loading={empLoading} clearable />
          </div>
          <button disabled={!clockEmpId || clockIn.isPending} className="btn-primary flex items-center gap-2" onClick={() => clockEmpId && clockIn.mutate({ id: clockEmpId })}>
            <LogIn size={15} />{clockIn.isPending ? '…' : 'Clock In'}
          </button>
          <button disabled={!clockEmpId || clockOut.isPending} className="btn-secondary flex items-center gap-2" onClick={() => clockEmpId && clockOut.mutate({ id: clockEmpId })}>
            <LogOut size={15} />{clockOut.isPending ? '…' : 'Clock Out'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select options={empOptions} value={form.employeeId} onChange={v => setForm(p => ({ ...p, employeeId: v }))} placeholder="Select employee *" loading={empLoading} label="Employee" />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date</label>
              <input className="input-base" type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <Select options={ATTENDANCE_STATUS_OPTIONS} value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} placeholder="Status" label="Status" searchable={false} />
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

      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-56">
          <Select options={[{ value: '', label: 'All Employees' }, ...empOptions]} value={filterEmpId} onChange={setFilterEmpId} placeholder="All Employees" loading={empLoading} clearable />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
          <input className="input-base w-40" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
          <input className="input-base w-40" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <DataTable data={records} isLoading={isLoading} emptyIcon={<CalendarDays size={40} />} emptyText="No attendance records."
        columns={[
          { key: 'employeeId', label: 'Employee', render: (r: any) => {
            const emp = empOptions.find(e => e.value === r.employeeId);
            return <span style={{ color: 'var(--text-secondary)' }}>{emp?.label ?? r.employeeId?.slice(0,8)}</span>;
          }},
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
