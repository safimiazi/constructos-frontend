'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, apiV2, apiV3, extendedApiClient } from '@/lib/api';
import type { SelectOption } from '@/components/ui/select';

// ─── Projects ─────────────────────────────────────────────────────────────────
export function useProjectOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-projects'],
    queryFn: () => apiClient.getProjects({ limit: 100 }),
    staleTime: 30000,
  });
  const options: SelectOption[] = (data?.data?.data ?? []).map((p: any) => ({
    value: p.id,
    label: p.name,
    description: p.location ?? p.status,
  }));
  return { options, isLoading };
}

// ─── Employees ────────────────────────────────────────────────────────────────
export function useEmployeeOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-employees'],
    queryFn: () => apiClient.getEmployees({ limit: 200 }),
    staleTime: 30000,
  });
  const options: SelectOption[] = (data?.data?.data ?? []).map((e: any) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName}`,
    description: e.designation ?? e.employeeCode,
  }));
  return { options, isLoading };
}

// ─── Users ────────────────────────────────────────────────────────────────────
export function useUserOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-users'],
    queryFn: () => apiClient.getUsers({ limit: 200 }),
    staleTime: 30000,
  });
  const options: SelectOption[] = (data?.data?.data ?? []).map((u: any) => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName}`,
    description: u.email,
  }));
  return { options, isLoading };
}

// ─── Vendors ──────────────────────────────────────────────────────────────────
export function useVendorOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-vendors'],
    queryFn: () => apiClient.getVendors({ limit: 200 } as any),
    staleTime: 30000,
  });
  const options: SelectOption[] = (data?.data?.data ?? []).map((v: any) => ({
    value: v.id,
    label: v.name,
    description: v.phone ?? v.email,
  }));
  return { options, isLoading };
}

// ─── Departments ──────────────────────────────────────────────────────────────
export function useDepartmentOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-departments'],
    queryFn: extendedApiClient.getDepartments,
    staleTime: 60000,
  });
  const options: SelectOption[] = (data?.data ?? []).map((d: any) => ({
    value: d.id,
    label: d.name,
    description: d.description,
  }));
  return { options, isLoading };
}

// ─── Leave Types ──────────────────────────────────────────────────────────────
export function useLeaveTypeOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-leave-types'],
    queryFn: apiV3.getLeaveTypes,
    staleTime: 60000,
  });
  const options: SelectOption[] = (data?.data ?? []).map((lt: any) => ({
    value: lt.id,
    label: lt.name,
    description: `${lt.annualEntitlement} days/year · ${lt.isPaid ? 'Paid' : 'Unpaid'}`,
  }));
  return { options, isLoading };
}

// ─── Bank Accounts ────────────────────────────────────────────────────────────
export function useBankAccountOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-bank-accounts'],
    queryFn: extendedApiClient.getBankAccounts,
    staleTime: 60000,
  });
  const options: SelectOption[] = (data?.data ?? []).map((b: any) => ({
    value: b.id,
    label: b.name,
    description: `${b.bankName} · ৳${Number(b.balance).toLocaleString()}`,
  }));
  return { options, isLoading };
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────
export function usePOOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-pos'],
    queryFn: () => apiClient.getPurchaseOrders({ limit: 100 }),
    staleTime: 30000,
  });
  const options: SelectOption[] = (data?.data?.data ?? []).map((po: any) => ({
    value: po.id,
    label: po.poNumber,
    description: `৳${Number(po.totalCost).toLocaleString()} · ${po.status}`,
  }));
  return { options, isLoading };
}

// ─── Clients (CRM) ────────────────────────────────────────────────────────────
export function useClientOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-clients'],
    queryFn: () => extendedApiClient.getClients({ limit: 200 } as any),
    staleTime: 30000,
  });
  const options: SelectOption[] = (data?.data?.data ?? []).map((c: any) => ({
    value: c.id,
    label: c.name,
    description: c.email ?? c.phone,
  }));
  return { options, isLoading };
}

// ─── GRNs ─────────────────────────────────────────────────────────────────────
export function useGRNOptions(poId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['select-grns', poId],
    queryFn: () => apiV2.getGRNs(poId),
    staleTime: 30000,
  });
  const options: SelectOption[] = ((data?.data ?? data) as any[] ?? []).map((g: any) => ({
    value: g.id,
    label: `GRN-${g.id.slice(0, 8)} (${new Date(g.receivedDate ?? g.createdAt).toLocaleDateString()})`,
  }));
  return { options, isLoading };
}

// ─── Vendor Invoices ──────────────────────────────────────────────────────────
export function useVendorInvoiceOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['select-vendor-invoices'],
    queryFn: () => apiClient.getInvoices({ type: 'vendor', limit: 200 } as any),
    staleTime: 30000,
  });
  const options: SelectOption[] = (data?.data?.data ?? []).map((inv: any) => ({
    value: inv.id,
    label: `${inv.invoiceNumber} — ৳${Number(inv.totalAmount).toLocaleString()}`,
    description: inv.status,
  }));
  return { options, isLoading };
}

// ─── Static option builders ───────────────────────────────────────────────────

export const STATUS_OPTIONS: Record<string, SelectOption[]> = {
  project: [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  task: [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'blocked', label: 'Blocked' },
  ],
  invoice: [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  leave: [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  employee: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'terminated', label: 'Terminated' },
  ],
  po: [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'approved', label: 'Approved' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
};

export const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const EMPLOYMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'daily_labor', label: 'Daily Labor' },
];

export const PROJECT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'renovation', label: 'Renovation' },
];

export const ROLE_OPTIONS: SelectOption[] = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
  { value: 'HR_MANAGER', label: 'HR Manager' },
  { value: 'PROCUREMENT_OFFICER', label: 'Procurement Officer' },
  { value: 'SITE_ENGINEER', label: 'Site Engineer' },
  { value: 'SALES_MANAGER', label: 'Sales Manager' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
];

export const LEAVE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'annual', label: 'Annual Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
];

export const INCIDENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'accident', label: 'Accident' },
  { value: 'near_miss', label: 'Near Miss' },
  { value: 'property_damage', label: 'Property Damage' },
];

export const SEVERITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'BDT', label: 'BDT — Bangladeshi Taka' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
];

export const PLAN_TIER_OPTIONS: SelectOption[] = [
  { value: 'STARTER', label: 'Starter', description: '৳4,999/month' },
  { value: 'PROFESSIONAL', label: 'Professional', description: '৳14,999/month' },
  { value: 'ENTERPRISE', label: 'Enterprise', description: '৳39,999+/month' },
];

// ─── Unit Options ─────────────────────────────────────────────────────────────
export const UNIT_OPTIONS: SelectOption[] = [
  { value: 'pcs', label: 'Pcs (Pieces)' },
  { value: 'kg', label: 'Kg (Kilogram)' },
  { value: 'ton', label: 'Ton' },
  { value: 'bag', label: 'Bag' },
  { value: 'ltr', label: 'Ltr (Litre)' },
  { value: 'mtr', label: 'Mtr (Metre)' },
  { value: 'sqft', label: 'Sq.Ft' },
  { value: 'sqm', label: 'Sq.M' },
  { value: 'cft', label: 'CFT (Cubic Feet)' },
  { value: 'rft', label: 'RFT (Running Feet)' },
  { value: 'box', label: 'Box' },
  { value: 'roll', label: 'Roll' },
  { value: 'set', label: 'Set' },
  { value: 'pair', label: 'Pair' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'drum', label: 'Drum' },
  { value: 'sheet', label: 'Sheet' },
];
