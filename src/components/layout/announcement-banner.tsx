'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiV2 } from '@/lib/api';
import { X, Megaphone, AlertTriangle, Wrench } from 'lucide-react';

const STYLES: Record<string, { bg: string; border: string; text: string; icon: React.ElementType }> = {
  info:        { bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.30)',  text: '#93c5fd', icon: Megaphone     },
  warning:     { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.30)',  text: '#fcd34d', icon: AlertTriangle },
  maintenance: { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.30)',   text: '#fca5a5', icon: Wrench        },
};

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
}

export function AnnouncementBanner({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data } = useQuery({
    queryKey: ['active-announcements'],
    queryFn: apiV2.getAnnouncementsForTenant,
    enabled: !isSuperAdmin,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const announcements: Announcement[] = !data
    ? []
    : Array.isArray(data)
    ? data
    : Array.isArray((data as { data?: Announcement[] }).data)
    ? (data as { data: Announcement[] }).data
    : [];

  const visible = announcements.filter((a) => !dismissed.has(a.id));

  if (isSuperAdmin || visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 px-4 pt-3">
      {visible.map((a) => {
        const s = STYLES[a.type] ?? STYLES.info;
        const Icon = s.icon;
        return (
          <div
            key={a.id}
            className="flex items-start gap-3 rounded-lg px-4 py-2.5 text-sm"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <Icon size={16} className="shrink-0 mt-0.5" style={{ color: s.text }} />
            <div className="flex-1 min-w-0">
              <span className="font-semibold mr-2" style={{ color: s.text }}>{a.title}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{a.message}</span>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, a.id]))}
              className="shrink-0 rounded p-0.5 transition-opacity opacity-60 hover:opacity-100"
              style={{ color: s.text }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
