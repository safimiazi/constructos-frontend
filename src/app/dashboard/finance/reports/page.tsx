'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { BarChart3, Building2, TrendingUp } from 'lucide-react';

export default function FinanceReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [startDate, setStartDate] = useState(firstOfYear);
  const [endDate, setEndDate] = useState(today);

  const { data: plData, refetch: refetchPL, isFetching: plFetching } = useQuery({
    queryKey: ['pl-report', startDate, endDate],
    queryFn: () => apiV2.getPLReport(startDate, endDate),
    enabled: false,
  });
  const { data: cfData, isLoading: cfLoading } = useQuery({
    queryKey: ['cashflow-report'],
    queryFn: apiV2.getCashflowReport,
  });
  const { data: bsData, isLoading: bsLoading } = useQuery({
    queryKey: ['balance-sheet'],
    queryFn: apiV2.getBalanceSheet,
  });

  const pl = plData?.data;
  const cf = cfData?.data;
  const bs = bsData?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Financial Reports" subtitle="P&L, Cash Flow & Balance Sheet" />

      {/* P&L */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} style={{ color: 'var(--brand-500)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Profit & Loss Statement</h2>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
            <input className="input-base w-40" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
            <input className="input-base w-40" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn-primary" onClick={() => refetchPL()} disabled={plFetching}>
              {plFetching ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>
        {pl ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Total Income', value: `৳${Number(pl.totalIncome).toLocaleString()}`, color: '#16a34a' },
                { label: 'Total Expense', value: `৳${Number(pl.totalExpense).toLocaleString()}`, color: '#dc2626' },
                { label: 'Net Profit', value: `৳${Number(pl.netProfit).toLocaleString()}`, color: pl.netProfit >= 0 ? '#16a34a' : '#dc2626' },
                { label: 'Profit Margin', value: `${pl.margin ?? 0}%`, color: (pl.margin ?? 0) >= 0 ? '#9333ea' : '#dc2626' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            {pl.breakdown && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>BREAKDOWN</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Client Invoices: </span>
                    <span className="font-medium" style={{ color: '#16a34a' }}>৳{Number(pl.breakdown.clientInvoices).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Vendor Invoices: </span>
                    <span className="font-medium" style={{ color: '#dc2626' }}>৳{Number(pl.breakdown.vendorInvoices).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Expense Claims: </span>
                    <span className="font-medium" style={{ color: '#f59e0b' }}>৳{Number(pl.breakdown.expenseClaims).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Accrual basis — includes all issued invoices (not just paid)</p>
              </div>
            )}
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              Period: {new Date(pl.period?.startDate).toLocaleDateString()} — {new Date(pl.period?.endDate).toLocaleDateString()}
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a date range and click Generate.</p>
        )}
      </div>

      {/* Cash Flow */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} style={{ color: 'var(--brand-500)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cash Flow Summary</h2>
        </div>
        {cfLoading ? (
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
        ) : cf ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Inflow', value: `৳${Number(cf.inflow).toLocaleString()}`, color: '#16a34a' },
                { label: 'Total Outflow', value: `৳${Number(cf.outflow).toLocaleString()}`, color: '#dc2626' },
                { label: 'Net Cash', value: `৳${Number(cf.net).toLocaleString()}`, color: cf.net >= 0 ? '#16a34a' : '#dc2626' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            {cf.breakdown && (
              <div className="mt-4 pt-4 grid grid-cols-3 gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-sm"><span style={{ color: 'var(--text-muted)' }}>Client Payments: </span><span className="font-medium" style={{ color: '#16a34a' }}>৳{Number(cf.breakdown.clientPayments).toLocaleString()}</span></div>
                <div className="text-sm"><span style={{ color: 'var(--text-muted)' }}>Vendor Payments: </span><span className="font-medium" style={{ color: '#dc2626' }}>৳{Number(cf.breakdown.vendorPayments).toLocaleString()}</span></div>
                <div className="text-sm"><span style={{ color: 'var(--text-muted)' }}>Expense Claims: </span><span className="font-medium" style={{ color: '#f59e0b' }}>৳{Number(cf.breakdown.expenseClaims).toLocaleString()}</span></div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Balance Sheet */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} style={{ color: 'var(--brand-500)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Balance Sheet</h2>
        </div>
        {bsLoading ? (
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
        ) : bs ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#16a34a' }}>Assets</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Cash & Bank</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>৳{Number(bs.assets?.cash ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Receivables</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>৳{Number(bs.assets?.receivables ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: '1px solid rgba(22,163,74,0.2)' }}>
                  <span style={{ color: '#16a34a' }}>Total Assets</span>
                  <span style={{ color: '#16a34a' }}>৳{Number(bs.assets?.total ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#dc2626' }}>Liabilities</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Payables</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>৳{Number(bs.liabilities?.payables ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: '1px solid rgba(220,38,38,0.2)' }}>
                  <span style={{ color: '#dc2626' }}>Total Liabilities</span>
                  <span style={{ color: '#dc2626' }}>৳{Number(bs.liabilities?.total ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.2)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#9333ea' }}>Equity</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span style={{ color: '#9333ea' }}>Net Equity</span>
                  <span style={{ color: bs.equity >= 0 ? '#9333ea' : '#dc2626' }}>৳{Number(bs.equity ?? 0).toLocaleString()}</span>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Assets − Liabilities</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
