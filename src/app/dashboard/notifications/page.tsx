'use client';

import { useNotifications, useMarkAllRead, useMarkRead } from '@/hooks/use-notifications';
import { PageHeader } from '@/components/ui/page-header';
import { Bell, CheckCheck, Check } from 'lucide-react';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications(1, 50);
  const markAll = useMarkAllRead();
  const markOne = useMarkRead();

  const notifications = data?.data?.data ?? [];
  const unread = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notifications" subtitle={`${unread} unread`}
        action={unread > 0 && (
          <button className="btn-secondary flex items-center gap-2" onClick={() => markAll.mutate()}>
            <CheckCheck size={15} /> Mark all read
          </button>
        )} />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No notifications</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>You&apos;re all caught up!</p>
          </div>
        ) : (
          <div>
            {notifications.map((n: any) => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors"
                style={{ borderBottom: '1px solid var(--border)', background: n.isRead ? 'transparent' : 'rgba(168,85,247,0.04)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: n.isRead ? 'var(--bg-muted)' : 'rgba(168,85,247,0.12)' }}>
                  <Bell size={14} style={{ color: n.isRead ? 'var(--text-muted)' : '#9333ea' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markOne.mutate(n.id)} className="p-1.5 rounded hover:bg-(--bg-muted) transition-colors shrink-0" style={{ color: '#9333ea' }}>
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
