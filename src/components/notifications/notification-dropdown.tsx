'use client';

import { Bell } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose: _ }: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <Bell size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
      </div>
    </div>
  );
}
