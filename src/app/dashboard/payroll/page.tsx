'use client';

import { useState } from 'react';
import { usePayrollRuns, useCreatePayrollRun, usePayrollItems } from '@/hooks/use-employees';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { Wallet, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';
import { apiClient, apiV4 } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEmployeeOptions } from '@/hooks/use-select-options';

const currentYear = new Date().getFullYear();
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const m = String(i + 1).padStart(2, '0');
  return { value: `${currentYear}-${m}`, label: new Date(currentYear, i).toLocaleString('en', { month: 'long', year: 'numeric' }) };
});

function PayrollItemRow({ item, empLabel, isDraft }: { item: any; empLabel: string; isDraft: boolean }) {
  const [editing, setEditing] = useState(false);
  const [ot, setOt] = useState(String(item.overtimePay ?? 0));
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: () => apiV4.updatePayrollItem(item.id, { overtimePay: Number(ot) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-items', item.runId] }); qc.invalidateQueries({ queryKey: ['payroll-runs'] }); setEditing(false); },
  });

  return (
    <tr key={item.id}>
      <td className="py-1.5 pr-4" style={{ color: 'var(--text-secondary)' }}>{empLabel}</td>
      <td className="py-1.5 pr-4">৳{Number(item.basicSalary).toLocaleString()}</td>
      <td className="py-1.5 pr-4">
        {editing ? (
          <input className="input-base text-xs py-0.5 w-24" type="number" value={ot} onChange={e => setOt(e.target.value)} />
        ) : (
          <span>৳{Number(item.overtimePay).toLocaleString()}</span>
        )}
      </td>
      <td className="py-1.5 pr-4" style={{ color: '#16a34a' }}>+৳{Number(item.totalBonuses).toLocaleString()}</td>
      <td className="py-1.5 pr-4" style={{ color: '#dc2626' }}>-৳{Number(item.totalDeductions).toLocaleString()}</td>
      <td className="py-1.5 pr-4 font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(item.netPay).toLocaleString()}</td>
      {isDraft && (
        <td className="py-1.5">
          {editing ? (
            <div className="flex gap-1">
              <button onClick={() => update.mutate()} disabled={update.isPending} className="p-1 rounded" style={{ color: '#16a34a' }}><Check size={12} /></button>
              <button onClick={() => { setEditing(false); setOt(String(item.overtimePay ?? 0)); }} className="p-1 rounded" style={{ color: '#dc2626' }}><X size={12} /></button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-(--bg-muted)" style={{ color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
          )}
        </td>
      )}
    </tr>
  );
}

function PayrollRunRow({ run }: { run: any }) {
  const [expanded, setExpanded] = useState(false);
  const { data: itemsData } = usePayrollItems(expanded ? run.id : '');
  const items = (itemsData?.data as any[]) ?? [];
  const { options: empOptions } = useEmployeeOptions();
  const qc = useQueryClient();
  const isDraft = run.status === 'draft';

  const approve = useMutation({
    mutationFn: () => apiClient.approvePayrollRun(run.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-runs'] }),
  });
  const genPayslips = useMutation({
    mutationFn: () => apiClient.generatePayslips(run.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-runs'] }),
  });

  return (
    <>
      <tr className="transition-colors hover:bg-(--bg-subtle)" style={{ borderBottom: '1px solid var(--border)' }}>
        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{run.payPeriod}</td>
        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{run.totalEmployees}</td>
        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(run.totalNetPay).toLocaleString()}</td>
        <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{run.payDate ? new Date(run.payDate).toLocaleDateString() : '—'}</td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            {isDraft && (
              <button onClick={() => approve.mutate()} disabled={approve.isPending} className="btn-secondary text-xs py-1 px-2">
                {approve.isPending ? '…' : 'Approve'}
              </button>
            )}
            {run.status === 'approved' && (
              <button onClick={() => genPayslips.mutate()} disabled={genPayslips.isPending} className="btn-secondary text-xs py-1 px-2">
                {genPayslips.isPending ? '…' : 'Gen Payslips'}
              </button>
            )}
            <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded hover:bg-(--bg-muted)" style={{ color: 'var(--text-muted)' }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && items.length > 0 && (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <td colSpan={6} className="px-4 py-3" style={{ background: 'var(--bg-subtle)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {['Employee','Basic','OT Pay','Bonuses','Deductions','Net Pay', isDraft ? 'Edit' : ''].map(h => (
                    <th key={h} className="text-left py-1 pr-4 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const emp = empOptions.find(e => e.value === item.employeeId);
                  return <PayrollItemRow key={item.id} item={item} empLabel={emp?.label ?? item.employeeId?.slice(0, 8)} isDraft={isDraft} />;
                })}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

export default function PayrollPage() {
  const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0, 7));
  const { data, isLoading } = usePayrollRuns();
  const create = useCreatePayrollRun();
  const runs = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Payroll" subtitle="Manage payroll runs"
        action={
          <div className="flex gap-2 items-end">
            <div className="w-52">
              <Select options={MONTH_OPTIONS} value={payPeriod} onChange={setPayPeriod} placeholder="Select month" />
            </div>
            <button className="btn-primary" disabled={create.isPending} onClick={() => create.mutate(payPeriod)}>
              {create.isPending ? 'Generating…' : '+ Run Payroll'}
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="card p-8 text-center"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} /></div>
      ) : runs.length === 0 ? (
        <div className="card p-12 text-center">
          <Wallet size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No payroll runs yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Pay Period','Employees','Total Net Pay','Status','Pay Date','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map((run: any) => <PayrollRunRow key={run.id} run={run} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}