'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { Building2 } from 'lucide-react';

export default function CompanyPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['company'], queryFn: apiV2.getCompany });
  const update = useMutation({ mutationFn: apiV2.updateCompany, onSuccess: () => qc.invalidateQueries({ queryKey: ['company'] }) });

  const company = data?.data;
  const [form, setForm] = useState<any>(null);
  const editing = form !== null;

  const startEdit = () => setForm({ companyName: company?.companyName, currency: company?.currency, timezone: company?.timezone, taxNumber: company?.taxNumber, address: company?.address, phone: company?.phone });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Company Profile" subtitle="Your organization settings"
        action={!editing && <button className="btn-secondary" onClick={startEdit}>Edit</button>} />

      {isLoading ? (
        <div className="card p-8 text-center"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} /></div>
      ) : editing ? (
        <div className="card p-6">
          <form onSubmit={e => { e.preventDefault(); update.mutate(form); setForm(null); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'companyName', label: 'Company Name', type: 'text' },
              { key: 'currency', label: 'Currency', type: 'text' },
              { key: 'timezone', label: 'Timezone', type: 'text' },
              { key: 'taxNumber', label: 'Tax Number', type: 'text' },
              { key: 'phone', label: 'Phone', type: 'text' },
              { key: 'address', label: 'Address', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                <input className="input-base" type={f.type} value={form[f.key] ?? ''} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={update.isPending} className="btn-primary">{update.isPending ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.12)' }}>
              <Building2 size={28} style={{ color: '#9333ea' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{company?.companyName}</h2>
              <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{company?.slug}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Currency', value: company?.currency },
              { label: 'Timezone', value: company?.timezone },
              { label: 'Status', value: company?.status },
              { label: 'Tax Number', value: company?.taxNumber ?? '—' },
              { label: 'Phone', value: company?.phone ?? '—' },
              { label: 'Address', value: company?.address ?? '—' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
