'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, Users, Building2, HardHat,
  CalendarDays, Wallet, ShoppingCart, Bell, FileText, Shield,
  Settings, LogOut, Sun, Moon, ChevronLeft, ChevronRight,
  Menu, X, BarChart3, ClipboardList, Package, Megaphone,
  Briefcase, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import type { UserRole } from '@/lib/api';

// ─── Nav definition ───────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: UserRole[];
  children?: { label: string; href: string }[];
}

const NAV: NavItem[] = [
  { label: 'Dashboard',     icon: LayoutDashboard, href: '/dashboard',              roles: ['SUPERADMIN','OWNER','ADMIN','PROJECT_MANAGER','FINANCE_MANAGER','HR_MANAGER','PROCUREMENT_OFFICER','SITE_ENGINEER','SALES_MANAGER','ACCOUNTANT'] },
  // SuperAdmin only
  { label: 'Tenants',       icon: Building2,       href: '/dashboard/organizations', roles: ['SUPERADMIN'] },
  { label: 'Plans',         icon: Package,         href: '/dashboard/packages',      roles: ['SUPERADMIN'] },
  { label: 'Announcements', icon: Megaphone,       href: '/dashboard/announcements', roles: ['SUPERADMIN'] },
  { label: 'Audit Logs',    icon: ClipboardList,   href: '/dashboard/audit-logs',    roles: ['SUPERADMIN','OWNER','ADMIN'] },
  // Tenant
  { label: 'Projects',      icon: FolderKanban,    href: '/dashboard/projects',          roles: ['OWNER','ADMIN','PROJECT_MANAGER','SITE_ENGINEER','FINANCE_MANAGER'] },
  { label: 'Tasks',         icon: ClipboardList,   href: '/dashboard/tasks',             roles: ['OWNER','ADMIN','PROJECT_MANAGER','SITE_ENGINEER'] },
  { label: 'HR',            icon: HardHat,         href: '/dashboard/employees',         roles: ['OWNER','ADMIN','HR_MANAGER','PROJECT_MANAGER'] },
  { label: 'Attendance',    icon: CalendarDays,    href: '/dashboard/attendance',        roles: ['OWNER','ADMIN','HR_MANAGER'] },
  { label: 'Leaves',        icon: Briefcase,       href: '/dashboard/leaves',            roles: ['OWNER','ADMIN','HR_MANAGER'] },
  { label: 'Payroll',       icon: Wallet,          href: '/dashboard/payroll',           roles: ['OWNER','ADMIN','HR_MANAGER','FINANCE_MANAGER'] },
  { label: 'Recruitment',   icon: Users,           href: '/dashboard/recruitment',       roles: ['OWNER','ADMIN','HR_MANAGER'] },
  { label: 'Departments',   icon: Building2,       href: '/dashboard/departments',       roles: ['OWNER','ADMIN','HR_MANAGER'] },
  { label: 'Finance',       icon: TrendingUp,      href: '/dashboard/invoices',          roles: ['OWNER','ADMIN','FINANCE_MANAGER','ACCOUNTANT'] },
  { label: 'Bank Accounts', icon: Wallet,          href: '/dashboard/bank-accounts',     roles: ['OWNER','ADMIN','FINANCE_MANAGER'] },
  { label: 'Procurement',   icon: ShoppingCart,    href: '/dashboard/purchase-orders',   roles: ['OWNER','ADMIN','PROCUREMENT_OFFICER','FINANCE_MANAGER'] },
  { label: 'Vendors',       icon: Package,         href: '/dashboard/suppliers',         roles: ['OWNER','ADMIN','PROCUREMENT_OFFICER'] },
  { label: 'Material Req',  icon: ShoppingCart,    href: '/dashboard/material-requests', roles: ['OWNER','ADMIN','PROCUREMENT_OFFICER','SITE_ENGINEER','PROJECT_MANAGER'] },
  { label: 'Inventory',     icon: Package,         href: '/dashboard/inventory',         roles: ['OWNER','ADMIN','PROCUREMENT_OFFICER'] },
  { label: 'CRM',           icon: TrendingUp,      href: '/dashboard/crm',               roles: ['OWNER','ADMIN','SALES_MANAGER'] },
  { label: 'HSE',           icon: Shield,          href: '/dashboard/hse',               roles: ['OWNER','ADMIN','PROJECT_MANAGER','SITE_ENGINEER'] },
  { label: 'Documents',     icon: FileText,        href: '/dashboard/documents',         roles: ['OWNER','ADMIN','PROJECT_MANAGER','FINANCE_MANAGER'] },
  { label: 'Reports',       icon: BarChart3,       href: '/dashboard/reports',           roles: ['OWNER','ADMIN','FINANCE_MANAGER','PROJECT_MANAGER'] },
  { label: 'Users',         icon: Users,           href: '/dashboard/users',         roles: ['OWNER','ADMIN','SUPERADMIN'] },
  { label: 'Branches',      icon: Building2,       href: '/dashboard/branches',      roles: ['OWNER','ADMIN'] },
  { label: 'Settings',      icon: Settings,        href: '/dashboard/settings',      roles: ['OWNER','ADMIN','SUPERADMIN'] },
  { label: 'Notifications', icon: Bell,            href: '/dashboard/notifications', roles: ['SUPERADMIN','OWNER','ADMIN','PROJECT_MANAGER','FINANCE_MANAGER','HR_MANAGER','PROCUREMENT_OFFICER','SITE_ENGINEER'] },
];

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({ collapsed, onClose, isMobile = false }: {
  collapsed: boolean; onClose?: () => void; isMobile?: boolean;
}) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  if (!user) return null;

  const visibleItems = NAV.filter((item) =>
    user.isSuperAdmin ? true : item.roles.includes(user.role)
  );

  const initials = ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--sidebar-bg)' }}>
      {/* Header */}
      <div className={`flex items-center px-3 py-4 min-h-16 ${collapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))' }}>
              C
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--sidebar-text)' }}>ConstructOS</span>
          </div>
        )}
        <button
          onClick={onClose ?? (() => {})}
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors"
          style={{ color: 'var(--sidebar-muted)' }}
        >
          {onClose ? <X size={14} /> : collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg text-sm font-medium transition-colors
                ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                ${active
                  ? 'text-white shadow-[0_2px_8px_rgba(126,34,206,0.35)]'
                  : 'hover:bg-(--sidebar-hover)'
                }`}
              style={{
                background: active ? 'var(--sidebar-active)' : undefined,
                color: active ? '#fff' : 'var(--sidebar-text)',
              }}
            >
              <Icon size={18} className="shrink-0" style={{ opacity: active ? 1 : 0.7 }} />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && active && <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 flex flex-col gap-0.5" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <button onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          className={`flex items-center rounded-lg text-sm font-medium w-full transition-colors
            ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}`}
          style={{ color: 'var(--sidebar-muted)' }}>
          {theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: 'var(--sidebar-hover)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br from-purple-600 to-purple-800">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--sidebar-text)' }}>
                {user.firstName} {user.lastName}
              </p>
              <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5"
                style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc' }}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-purple-600 to-purple-800"
              title={`${user.firstName} ${user.lastName}`}>
              {initials}
            </div>
          </div>
        )}

        <button onClick={logout} title={collapsed ? 'Logout' : undefined}
          className={`flex items-center rounded-lg text-sm font-medium w-full transition-colors
            ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}`}
          style={{ color: 'var(--sidebar-muted)' }}>
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))' }}>
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} isMobile />
      </aside>

      <aside className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden transition-all duration-300 ${collapsed ? 'w-[4.5rem]' : 'w-64'}`}>
        <SidebarContent collapsed={collapsed} onClose={() => setCollapsed(c => !c)} />
      </aside>
    </>
  );
}
