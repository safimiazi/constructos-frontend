'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { AnnouncementBanner } from '@/components/layout/announcement-banner';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-subtle)' }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
    </div>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
console.log("user", user)
  // Only run on client — prevents SSR/client mismatch
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [mounted, isLoading, isAuthenticated, router]);

  // Always render the same thing on server and first client paint
  if (!mounted || isLoading) return <Spinner />;
  if (!isAuthenticated) return <Spinner />;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-subtle)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-2 h-14 pl-16 lg:pl-4"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-purple-600 to-purple-800">
                  {((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <AnnouncementBanner isSuperAdmin={user?.isSuperAdmin ?? false} />
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
