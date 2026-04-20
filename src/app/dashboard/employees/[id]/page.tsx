'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEmployee } from '@/hooks/use-employees';
import { useAttendance, useLeaves } from '@/hooks/use-employees';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

type Tab = 'attendance' | 'leaves';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('attendance');

  const { data: empData, isLoading } = useEmployee(id);
  const { data: attData } = useAttendance({ employeeId: id });
  const { data: leaveData } = useLeaves({ employeeId: id });

  const emp = empData?.data;
  const attendance = (attData?.data as any) ?? [];
  const leaves = (leaveData?.data as any) ?? [];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!emp) return <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Employee not found.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/dashboard/employees" className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} /> Back to Employees
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 bg-gradient-to-br from-purple-600 to-purple-800">
            {((emp.firstName?.[0] ?? '') + (emp.lastName?.[0] ?? '')).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{emp.firstName} {emp.lastName}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{emp.designation ?? 'No designation'}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={emp.status} />
              <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>
                {emp.employmentType?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Basic Salary</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>৳{Number(emp.basicSalary).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Employee Code', value: emp.employeeCode },
            { label: 'Email', value: emp.email },
            { label: 'Phone', value: emp.phone ?? '—' },
            { label: 'Join Date', value: new Date(emp.joinDate).toLocaleDateString() },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-sm font-medium mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--bg-muted)' }}>
        {(['attendance', 'leaves'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize"
            style={{ background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'attendance' && (
        <DataTable data={attendance} emptyText="No attendance records."
          columns={[
            { key: 'date', label: 'Date', render: (r: any) => <span>{new Date(r.date).toLocaleDateString()}</span> },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
            { key: 'checkIn', label: 'Check In', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</span> },
            { key: 'checkOut', label: 'Check Out', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</span> },
            { key: 'workingHours', label: 'Hours', render: (r: any) => <span>{r.workingHours}h</span> },
          ]}
        />
      )}

      {tab === 'leaves' && (
        <DataTable data={leaves} emptyText="No leave records."
          columns={[
            { key: 'leaveType', label: 'Type', render: (r: any) => <span className="capitalize">{r.leaveType}</span> },
            { key: 'startDate', label: 'From', render: (r: any) => <span>{new Date(r.startDate).toLocaleDateString()}</span> },
            { key: 'endDate', label: 'To', render: (r: any) => <span>{new Date(r.endDate).toLocaleDateString()}</span> },
            { key: 'totalDays', label: 'Days', render: (r: any) => <span>{r.totalDays}</span> },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
            { key: 'reason', label: 'Reason', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.reason}</span> },
          ]}
        />
      )}
    </div>
  );
}
