'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV3 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { CalendarDays, Plus } from 'lucide-react';

export default function LeaveTypesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', annualEntitlement: '0', isPaid: true, carryForward: false });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['leave-types'], queryFn: apiV3.getLeaveTypes });
  const create = useMutation({
    mutationFn: apiV3.createLeaveType,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leave-types'] }); setShowForm(false); setForm({ name: '', annualEntitlement: '0', isPaid: true, carryForward: false }); },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => apiV3.updateLeaveType(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leave-types'] }),
  });

  const leaveTypes = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Leave Types" subtitle="Configure leave entitlements for your organization"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Leave Type</button>} />

      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, annualEntitlement: Number(form.annualEntitlement) }); }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Leave type name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Annual entitlement (days)" value={form.annualEntitlement} onChange={e => setForm(p => ({ ...p, annualEntitlement: e.target.value }))} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPaid} onChange={e => setForm(p => ({ ...p, isPaid: e.target.checked }))} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Paid leave</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.carryForward} onChange={e => setForm(p => ({ ...p, carryForward: e.target.checked }))} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Carry forward to next year</span>
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable data={leaveTypes} isLoading={isLoading} emptyIcon={<CalendarDays size={40} />} emptyText="No leave types configured."
        columns={[
          { key: 'name', label: 'Leave Type', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'annualEntitlement', label: 'Days/Year', render: (r: any) => <span style={{ color: 'var(--text-secondary)' }}>{r.annualEntitlement} days</span> },
          { key: 'isPaid', label: 'Paid', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: r.isPaid ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: r.isPaid ? '#16a34a' : '#6b7280' }}>{r.isPaid ? 'Paid' : 'Unpaid'}</span> },
          { key: 'carryForward', label: 'Carry Forward', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.carryForward ? 'Yes' : 'No'}</span> },
          { key: 'isActive', label: 'Status', render: (r: any) => (
            <button onClick={() => update.mutate({ id: r.id, body: { isActive: !r.isActive } })} className="text-xs px-2 py-0.5 rounded-full" style={{ background: r.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: r.isActive ? '#16a34a' : '#6b7280' }}>
              {r.isActive ? 'Active' : 'Inactive'}
            </button>
          )},
        ]}
      />
    </div>
  );
}
