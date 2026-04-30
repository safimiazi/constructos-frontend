'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV4 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { Percent, Plus } from 'lucide-react';

const TAX_TYPE_OPTIONS = [
  { value: 'VAT', label: 'VAT', description: 'Value Added Tax' },
  { value: 'WHT', label: 'WHT', description: 'Withholding Tax' },
  { value: 'SERVICE_TAX', label: 'Service Tax', description: 'Service charge tax' },
  { value: 'INCOME_TAX', label: 'Income Tax', description: 'Corporate income tax' },
];

export default function TaxRatesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rate: '', type: 'VAT', description: '' });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['tax-rates'], queryFn: apiV4.getTaxRates });
  const create = useMutation({ mutationFn: apiV4.createTaxRate, onSuccess: () => { qc.invalidateQueries({ queryKey: ['tax-rates'] }); setShowForm(false); } });
  const taxRates = (data?.data as any) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Tax Rates" subtitle="VAT, WHT and other tax configurations"
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}><Plus size={16} />Add Tax Rate</button>} />
      {showForm && (
        <div className="card p-5">
          <form onSubmit={e => { e.preventDefault(); create.mutate({ ...form, rate: Number(form.rate) }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-base" placeholder="Name (e.g. VAT 15%) *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-base" type="number" step="0.01" placeholder="Rate (%) *" required value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} />
            <Select options={TAX_TYPE_OPTIONS} value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} placeholder="Tax type" label="Type" searchable={false} />
            <input className="input-base" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="btn-primary">{create.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable data={taxRates} isLoading={isLoading} emptyIcon={<Percent size={40} />} emptyText="No tax rates configured."
        columns={[
          { key: 'name', label: 'Name', render: (r: any) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span> },
          { key: 'type', label: 'Type', render: (r: any) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>{r.type}</span> },
          { key: 'rate', label: 'Rate', render: (r: any) => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.rate}%</span> },
          { key: 'description', label: 'Description', render: (r: any) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.description ?? '—'}</span> },
          { key: 'isActive', label: 'Status', render: (r: any) => <span className="text-xs" style={{ color: r.isActive ? '#16a34a' : '#6b7280' }}>{r.isActive ? 'Active' : 'Inactive'}</span> },
        ]}
      />
    </div>
  );
}
