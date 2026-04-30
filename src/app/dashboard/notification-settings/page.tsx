'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Bell, CheckCircle } from 'lucide-react';

const NOTIFICATION_EVENTS = [
  { key: 'leave_approved', label: 'Leave Approved/Rejected', category: 'HR' },
  { key: 'payroll_approved', label: 'Payroll Run Approved', category: 'HR' },
  { key: 'invoice_paid', label: 'Invoice Paid', category: 'Finance' },
  { key: 'invoice_overdue', label: 'Invoice Overdue', category: 'Finance' },
  { key: 'project_update', label: 'Project Progress Update', category: 'Projects' },
  { key: 'task_assigned', label: 'Task Assigned to Me', category: 'Projects' },
  { key: 'issue_reported', label: 'New Issue Reported', category: 'Projects' },
  { key: 'po_approved', label: 'Purchase Order Approved', category: 'Procurement' },
  { key: 'mr_approved', label: 'Material Request Approved', category: 'Procurement' },
  { key: 'incident_reported', label: 'Safety Incident Reported', category: 'HSE' },
  { key: 'announcement', label: 'Platform Announcements', category: 'System' },
];

const CHANNELS = ['email', 'in_app'];
const STORAGE_KEY = 'cos_notification_prefs';

function defaultSettings() {
  const s: Record<string, Record<string, boolean>> = {};
  NOTIFICATION_EVENTS.forEach(e => { s[e.key] = { email: true, in_app: true }; });
  return s;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<Record<string, Record<string, boolean>>>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const toggle = (eventKey: string, channel: string) => {
    setSettings(p => ({ ...p, [eventKey]: { ...p[eventKey], [channel]: !p[eventKey][channel] } }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
  };

  const categories = [...new Set(NOTIFICATION_EVENTS.map(e => e.category))];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notification Settings" subtitle="Control which notifications you receive"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={handleSave}>
            {saved ? <><CheckCircle size={14} /> Saved</> : 'Save Preferences'}
          </button>
        }
      />

      {categories.map(cat => (
        <div key={cat} className="card overflow-hidden">
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{cat}</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {NOTIFICATION_EVENTS.filter(e => e.category === cat).map(event => (
              <div key={event.key} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2">
                  <Bell size={14} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{event.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  {CHANNELS.map(ch => (
                    <label key={ch} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[event.key]?.[ch] ?? true}
                        onChange={() => toggle(event.key, ch)}
                        className="rounded"
                      />
                      <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{ch.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
