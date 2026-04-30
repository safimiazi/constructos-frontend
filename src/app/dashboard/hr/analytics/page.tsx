'use client';
import { useQuery } from '@tanstack/react-query';
import { apiV4 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingDown, Clock, DollarSign } from 'lucide-react';

export default function HRAnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['hr-analytics'], queryFn: apiV4.getHRAnalytics });
  const stats = data?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="HR Analytics" subtitle="Workforce insights & metrics" />
      {isLoading ? (
        <div className="card p-8 text-center"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} /></div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Employees', value: String(stats.totalEmployees), icon: Users, color: '#9333ea' },
              { label: 'Active', value: String(stats.activeEmployees), icon: Users, color: '#16a34a' },
              { label: 'Turnover Rate', value: `${stats.turnoverRate}%`, icon: TrendingDown, color: '#ef4444' },
              { label: 'Total OT Hours', value: `${Number(stats.totalOvertimeHours).toFixed(1)}h`, icon: Clock, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + '20' }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Headcount by Department</p>
              {stats.deptBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.deptBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="departmentName" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" name="Employees" fill="#9333ea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No department data yet.</p>}
            </div>

            <div className="card p-5">
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Payroll Cost Summary</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.12)' }}>
                  <DollarSign size={24} style={{ color: '#9333ea' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>৳{Number(stats.totalPayrollCost).toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total payroll cost (all runs)</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'On Leave', value: stats.onLeave, color: '#f59e0b' },
                  { label: 'Terminated', value: stats.terminated, color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
