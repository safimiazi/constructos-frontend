'use client';
import { useQuery } from '@tanstack/react-query';
import { apiV4 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function SpendAnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['spend-analytics'], queryFn: apiV4.getSpendAnalytics });
  const spendData = (data?.data as any) ?? [];
  const totalSpend = spendData.reduce((s: number, d: any) => s + Number(d.totalSpend), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Spend Analytics" subtitle="Procurement spend by vendor" />
      {!isLoading && spendData.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Spend', value: `৳${totalSpend.toLocaleString()}`, color: '#9333ea' },
              { label: 'Vendors', value: String(spendData.length), color: '#3b82f6' },
              { label: 'Avg per Vendor', value: `৳${Math.round(totalSpend / spendData.length).toLocaleString()}`, color: '#16a34a' },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Vendors by Spend</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={spendData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `৳${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="vendorName" type="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip formatter={(v: any) => `৳${Number(v).toLocaleString()}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="totalSpend" name="Total Spend" fill="#9333ea" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Vendor ID','PO Count','Total Spend','% of Total'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {spendData.map((d: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--brand-500)' }}>{d.vendorName ?? d.vendorId?.slice(0, 8) + '…'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{d.poCount}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>৳{Number(d.totalSpend).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{totalSpend > 0 ? Math.round(Number(d.totalSpend) / totalSpend * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!isLoading && spendData.length === 0 && (
        <div className="card p-12 text-center">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No procurement data yet.</p>
        </div>
      )}
    </div>
  );
}
