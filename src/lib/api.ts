const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = "cos_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function clearTokens(): void {
  setAccessToken(null);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "SUPERADMIN"
  | "OWNER"
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "FINANCE_MANAGER"
  | "HR_MANAGER"
  | "PROCUREMENT_OFFICER"
  | "SITE_ENGINEER"
  | "SALES_MANAGER"
  | "ACCOUNTANT"
  | "CLIENT"
  | "SUBCONTRACTOR";

export type PlanTier = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string | null;
  isSuperAdmin: boolean;
  avatarUrl?: string | null;
  status?: string;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  companyName: string;
  logoUrl?: string | null;
  status: "active" | "suspended" | "trial" | "cancelled";
  trialEndsAt?: string | null;
  timezone: string;
  currency: string;
  planId?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  phone?: string | null;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  priceMonthly: number;
  priceAnnual: number;
  maxUsers: number | null;
  maxProjects: number | null;
  storageGb: number;
  features: Record<string, boolean>;
  isActive: boolean;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  description?: string | null;
  clientId?: string | null;
  location?: string | null;
  budgetAmount: number;
  startDate?: string | null;
  endDate?: string | null;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  projectManagerId?: string | null;
  completionPercentage: number;
  contractNumber?: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  assignedTo?: string | null;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  startDate?: string | null;
  dueDate?: string | null;
  progressPct: number;
  budgetAmount: number;
  wbsCode?: string | null;
}

export interface DailyLog {
  id: string;
  projectId: string;
  taskId?: string | null;
  date: string;
  workDone: string;
  progressPct: number;
  blockers?: string | null;
  photos: string[];
  weather?: string | null;
  workersCount: number;
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  departmentId?: string | null;
  designation?: string | null;
  employmentType: "full_time" | "part_time" | "contract" | "daily_labor";
  status: "active" | "inactive" | "on_leave" | "terminated";
  joinDate: string;
  basicSalary: number;
  branchId?: string | null;
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: "present" | "absent" | "late" | "half_day" | "on_leave";
  workingHours: number;
  overtimeHours: number;
  notes?: string | null;
}

export interface Leave {
  id: string;
  employeeId: string;
  leaveType: "sick" | "casual" | "annual" | "unpaid" | "maternity";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}

export interface PayrollRun {
  id: string;
  payPeriod: string;
  totalEmployees: number;
  totalNetPay: number;
  status: "draft" | "approved" | "paid";
  payDate?: string | null;
  createdAt: string;
}

export interface PayrollItem {
  id: string;
  runId: string;
  employeeId: string;
  basicSalary: number;
  overtimePay: number;
  bonuses: { label: string; amount: number }[];
  deductions: { label: string; amount: number }[];
  totalBonuses: number;
  totalDeductions: number;
  netPay: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: "client" | "vendor";
  projectId?: string | null;
  clientId?: string | null;
  vendorId?: string | null;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  notes?: string | null;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  taxNumber?: string | null;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  projectId?: string | null;
  items: {
    description: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalCost: number;
  status: "draft" | "sent" | "approved" | "received" | "cancelled";
  expectedDate?: string | null;
  receivedDate?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  tenantId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── HTTP client ──────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("cos_refresh_token")
        : null;
    if (!refreshToken) return null;

    const res = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const newToken = body?.data?.accessToken;
    if (newToken) {
      setAccessToken(newToken);
      // Update stored refresh token if a new one was issued
      if (body?.data?.refreshToken && typeof window !== "undefined") {
        localStorage.setItem("cos_refresh_token", body.data.refreshToken);
      }
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/v1${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && !path.includes("/auth/")) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      if (newToken) {
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        // Retry original request with new token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retry = await fetch(`${API_BASE_URL}/v1${path}`, {
          ...options,
          headers: retryHeaders,
        });
        if (!retry.ok) {
          let body: { error?: { message?: string } } = {};
          try {
            body = await retry.json();
          } catch {
            /* ignore */
          }
          throw new ApiError(
            retry.status,
            body?.error?.message ?? retry.statusText,
          );
        }
        if (retry.status === 204) return undefined as T;
        return retry.json();
      } else {
        // Refresh failed — clear tokens and redirect to login
        clearTokens();
        if (typeof window !== "undefined") {
          localStorage.removeItem("cos_user");
          window.location.href = "/login";
        }
        throw new ApiError(401, "Session expired. Please log in again.");
      }
    } else {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push(async (newToken: string) => {
          try {
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            };
            const retry = await fetch(`${API_BASE_URL}/v1${path}`, {
              ...options,
              headers: retryHeaders,
            });
            if (!retry.ok) {
              let body: { error?: { message?: string } } = {};
              try {
                body = await retry.json();
              } catch {
                /* ignore */
              }
              reject(
                new ApiError(
                  retry.status,
                  body?.error?.message ?? retry.statusText,
                ),
              );
            } else {
              resolve(retry.status === 204 ? (undefined as T) : retry.json());
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  }

  if (!res.ok) {
    let body: { error?: { message?: string } } = {};
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, body?.error?.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function qs(params?: Record<string, unknown>): string {
  if (!params) return "";
  const p = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  return p.length
    ? "?" + new URLSearchParams(p as [string, string][]).toString()
    : "";
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const apiClient = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  login: (body: { email: string; password: string }) =>
    request<
      ApiResponse<{ accessToken: string; refreshToken: string; user: User }>
    >("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  register: (body: {
    companyName: string;
    slug: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) =>
    request<ApiResponse<{ accessToken: string; user: User }>>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) },
    ),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  // ── Users ──────────────────────────────────────────────────────────────────
  getMe: () => request<ApiResponse<User>>("/users/me"),

  getUsers: (params?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) =>
    request<PaginatedResponse<User>>(
      `/users${qs(params as Record<string, unknown>)}`,
    ),

  inviteUser: (body: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    password: string;
  }) =>
    request<ApiResponse<User>>("/users/invite", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateUser: (id: string, body: Partial<User>) =>
    request<ApiResponse<User>>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/users/me/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  deleteUser: (id: string) =>
    request<void>(`/users/${id}`, { method: "DELETE" }),

  // ── Projects ───────────────────────────────────────────────────────────────
  getProjects: (params?: { status?: string; page?: number; limit?: number }) =>
    request<PaginatedResponse<Project>>(
      `/projects${qs(params as Record<string, unknown>)}`,
    ),

  getProject: (id: string) => request<ApiResponse<Project>>(`/projects/${id}`),

  createProject: (body: Partial<Project>) =>
    request<ApiResponse<Project>>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProject: (id: string, body: Partial<Project>) =>
    request<ApiResponse<Project>>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: "DELETE" }),

  getTasks: (projectId: string) =>
    request<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`),

  createTask: (projectId: string, body: Partial<Task>) =>
    request<ApiResponse<Task>>(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateTask: (projectId: string, taskId: string, body: Partial<Task>) =>
    request<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteTask: (projectId: string, taskId: string) =>
    request<void>(`/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    }),

  getDailyLogs: (projectId: string) =>
    request<ApiResponse<DailyLog[]>>(`/projects/${projectId}/daily-logs`),

  createDailyLog: (projectId: string, body: Partial<DailyLog>) =>
    request<ApiResponse<DailyLog>>(`/projects/${projectId}/daily-logs`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ── HR ─────────────────────────────────────────────────────────────────────
  getEmployees: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) =>
    request<PaginatedResponse<Employee>>(
      `/hr/employees${qs(params as Record<string, unknown>)}`,
    ),

  getEmployee: (id: string) =>
    request<ApiResponse<Employee>>(`/hr/employees/${id}`),

  createEmployee: (body: Partial<Employee>) =>
    request<ApiResponse<Employee>>("/hr/employees", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateEmployee: (id: string, body: Partial<Employee>) =>
    request<ApiResponse<Employee>>(`/hr/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteEmployee: (id: string) =>
    request<void>(`/hr/employees/${id}`, { method: "DELETE" }),

  getAttendance: (params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    request<ApiResponse<Attendance[]>>(
      `/hr/attendance${qs(params as Record<string, unknown>)}`,
    ),

  createAttendance: (body: Partial<Attendance>) =>
    request<ApiResponse<Attendance>>("/hr/attendance", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getLeaves: (params?: { employeeId?: string; status?: string }) =>
    request<ApiResponse<Leave[]>>(
      `/hr/leaves${qs(params as Record<string, unknown>)}`,
    ),

  createLeave: (body: Partial<Leave>) =>
    request<ApiResponse<Leave>>("/hr/leaves", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  approveLeave: (id: string) =>
    request<ApiResponse<Leave>>(`/hr/leaves/${id}/approve`, {
      method: "PATCH",
    }),

  rejectLeave: (id: string, reason: string) =>
    request<ApiResponse<Leave>>(`/hr/leaves/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  getPayrollRuns: () => request<ApiResponse<PayrollRun[]>>("/hr/payroll/runs"),

  createPayrollRun: (payPeriod: string) =>
    request<ApiResponse<PayrollRun>>("/hr/payroll/runs", {
      method: "POST",
      body: JSON.stringify({ payPeriod }),
    }),

  getPayrollItems: (runId: string) =>
    request<ApiResponse<PayrollItem[]>>(`/hr/payroll/runs/${runId}/items`),

  approvePayrollRun: (runId: string) =>
    request<ApiResponse<PayrollRun>>(`/hr/payroll/runs/${runId}/approve`, {
      method: "PATCH",
    }),

  generatePayslips: (runId: string) =>
    request<ApiResponse<unknown>>(`/hr/payroll/runs/${runId}/payslips`, {
      method: "POST",
    }),

  getEmployeePayslips: (employeeId: string) =>
    request<ApiResponse<unknown[]>>(
      `/hr/payroll/employees/${employeeId}/payslips`,
    ),

  // ── Finance ────────────────────────────────────────────────────────────────
  getInvoices: (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) =>
    request<PaginatedResponse<Invoice>>(
      `/finance/invoices${qs(params as Record<string, unknown>)}`,
    ),

  getInvoice: (id: string) =>
    request<ApiResponse<Invoice>>(`/finance/invoices/${id}`),

  getInvoiceStats: () =>
    request<
      ApiResponse<{
        totalInvoiced: number;
        totalPaid: number;
        overdueCount: number;
        draftCount: number;
      }>
    >("/finance/invoices/stats"),

  createInvoice: (body: Partial<Invoice>) =>
    request<ApiResponse<Invoice>>("/finance/invoices", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateInvoice: (id: string, body: Partial<Invoice>) =>
    request<ApiResponse<Invoice>>(`/finance/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  updateInvoiceStatus: (id: string, status: Invoice["status"]) =>
    request<ApiResponse<Invoice>>(`/finance/invoices/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteInvoice: (id: string) =>
    request<void>(`/finance/invoices/${id}`, { method: "DELETE" }),

  // ── Procurement ────────────────────────────────────────────────────────────
  getVendors: (params?: { search?: string; page?: number; limit?: number }) =>
    request<PaginatedResponse<Vendor>>(
      `/procurement/vendors${qs(params as Record<string, unknown>)}`,
    ),

  createVendor: (body: Partial<Vendor>) =>
    request<ApiResponse<Vendor>>("/procurement/vendors", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateVendor: (id: string, body: Partial<Vendor>) =>
    request<ApiResponse<Vendor>>(`/procurement/vendors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteVendor: (id: string) =>
    request<void>(`/procurement/vendors/${id}`, { method: "DELETE" }),

  getPurchaseOrders: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) =>
    request<PaginatedResponse<PurchaseOrder>>(
      `/procurement/purchase-orders${qs(params as Record<string, unknown>)}`,
    ),

  createPurchaseOrder: (body: Partial<PurchaseOrder>) =>
    request<ApiResponse<PurchaseOrder>>("/procurement/purchase-orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updatePurchaseOrder: (id: string, body: Partial<PurchaseOrder>) =>
    request<ApiResponse<PurchaseOrder>>(`/procurement/purchase-orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deletePurchaseOrder: (id: string) =>
    request<void>(`/procurement/purchase-orders/${id}`, { method: "DELETE" }),

  // ── Notifications ──────────────────────────────────────────────────────────
  getNotifications: (page = 1, limit = 20) =>
    request<PaginatedResponse<Notification>>(
      `/notifications?page=${page}&limit=${limit}`,
    ),

  getUnreadCount: () =>
    request<ApiResponse<{ count: number }>>("/notifications/unread-count"),

  markNotificationRead: (id: string) =>
    request<void>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllNotificationsRead: () =>
    request<void>("/notifications/read-all", { method: "PATCH" }),

  // ── Audit Logs ─────────────────────────────────────────────────────────────
  getAuditLogs: (params?: { action?: string; page?: number; limit?: number }) =>
    request<PaginatedResponse<AuditLog>>(
      `/audit-logs${qs(params as Record<string, unknown>)}`,
    ),

  // ── SuperAdmin ─────────────────────────────────────────────────────────────
  getSuperAdminStats: () =>
    request<
      ApiResponse<{
        totalTenants: number;
        activeCount: number;
        trialCount: number;
        suspendedCount: number;
        cancelledCount: number;
        totalUsers: number;
        recentTenants: Tenant[];
        expiringTrials: Tenant[];
      }>
    >("/superadmin/stats"),

  getTenants: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    request<PaginatedResponse<Tenant>>(
      `/superadmin/tenants${qs(params as Record<string, unknown>)}`,
    ),

  getTenant: (id: string) =>
    request<ApiResponse<Tenant>>(`/superadmin/tenants/${id}`),

  updateTenantStatus: (id: string, status: Tenant["status"]) =>
    request<ApiResponse<Tenant>>(`/superadmin/tenants/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getPlans: () => request<ApiResponse<Plan[]>>("/superadmin/plans"),

  createPlan: (body: Partial<Plan>) =>
    request<ApiResponse<Plan>>("/superadmin/plans", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updatePlan: (id: string, body: Partial<Plan>) =>
    request<ApiResponse<Plan>>(`/superadmin/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getSuperAdminGrowth: () =>
    request<ApiResponse<any[]>>("/superadmin/analytics/growth"),
  getSuperAdminTenantStatus: () =>
    request<ApiResponse<any[]>>("/superadmin/analytics/tenant-status"),
  getSuperAdminPlanDist: () =>
    request<ApiResponse<any[]>>("/superadmin/analytics/plan-distribution"),
  getSuperAdminTopTenants: () =>
    request<ApiResponse<any[]>>("/superadmin/analytics/top-tenants"),
};

// ─── Extended API (appended) ──────────────────────────────────────────────────

export const extendedApiClient = {
  // CRM
  getClients: (p?: { search?: string; page?: number }) =>
    request<PaginatedResponse<any>>(`/crm/clients${qs(p as any)}`),
  createClient: (b: any) =>
    request<ApiResponse<any>>("/crm/clients", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  updateClient: (id: string, b: any) =>
    request<ApiResponse<any>>(`/crm/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
  deleteClient: (id: string) =>
    request<void>(`/crm/clients/${id}`, { method: "DELETE" }),
  getLeadsList: (p?: { stage?: string; page?: number }) =>
    request<PaginatedResponse<any>>(`/crm/leads${qs(p as any)}`),
  getPipelineSummary: () => request<ApiResponse<any[]>>("/crm/leads/pipeline"),
  createLead: (b: any) =>
    request<ApiResponse<any>>("/crm/leads", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  moveLeadStage: (id: string, stage: string) =>
    request<ApiResponse<any>>(`/crm/leads/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }),
  deleteLead: (id: string) =>
    request<void>(`/crm/leads/${id}`, { method: "DELETE" }),

  // HSE
  getIncidents: (p?: { projectId?: string; status?: string; page?: number }) =>
    request<PaginatedResponse<any>>(`/hse/incidents${qs(p as any)}`),
  getIncidentStats: () => request<ApiResponse<any[]>>("/hse/incidents/stats"),
  createIncident: (b: any) =>
    request<ApiResponse<any>>("/hse/incidents", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  updateIncident: (id: string, b: any) =>
    request<ApiResponse<any>>(`/hse/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
  closeIncident: (id: string) =>
    request<ApiResponse<any>>(`/hse/incidents/${id}/close`, {
      method: "PATCH",
    }),

  // Documents
  getDocuments: (p?: {
    projectId?: string;
    folder?: string;
    search?: string;
    page?: number;
  }) => request<PaginatedResponse<any>>(`/documents${qs(p as any)}`),
  getDocumentFolders: () => request<ApiResponse<any[]>>("/documents/folders"),
  createDocument: (b: any) =>
    request<ApiResponse<any>>("/documents", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  approveDocument: (id: string) =>
    request<ApiResponse<any>>(`/documents/${id}/approve`, { method: "PATCH" }),
  deleteDocument: (id: string) =>
    request<void>(`/documents/${id}`, { method: "DELETE" }),

  // Finance extended
  getBudgets: (projectId: string) =>
    request<ApiResponse<any[]>>(`/finance/budgets/${projectId}`),
  getBudgetSummary: (projectId: string) =>
    request<ApiResponse<any>>(`/finance/budgets/${projectId}/summary`),
  createBudget: (b: any) =>
    request<ApiResponse<any>>("/finance/budgets", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  deleteBudget: (id: string) =>
    request<void>(`/finance/budgets/${id}`, { method: "DELETE" }),
  getBankAccounts: () => request<ApiResponse<any[]>>("/finance/bank-accounts"),
  createBankAccount: (b: any) =>
    request<ApiResponse<any>>("/finance/bank-accounts", {
      method: "POST",
      body: JSON.stringify(b),
    }),

  // HR extended
  getDepartments: () => request<ApiResponse<any[]>>("/hr/departments"),
  createDepartment: (b: any) =>
    request<ApiResponse<any>>("/hr/departments", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  updateDepartment: (id: string, b: any) =>
    request<ApiResponse<any>>(`/hr/departments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
  deleteDepartment: (id: string) =>
    request<void>(`/hr/departments/${id}`, { method: "DELETE" }),
  getJobs: () => request<ApiResponse<any[]>>("/hr/jobs"),
  createJob: (b: any) =>
    request<ApiResponse<any>>("/hr/jobs", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  getApplicants: (jobId: string) =>
    request<ApiResponse<any[]>>(`/hr/jobs/${jobId}/applicants`),
  createApplicant: (jobId: string, b: any) =>
    request<ApiResponse<any>>(`/hr/jobs/${jobId}/applicants`, {
      method: "POST",
      body: JSON.stringify(b),
    }),
  moveApplicantStage: (id: string, stage: string) =>
    request<ApiResponse<any>>(`/hr/applicants/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }),

  // Procurement extended
  getMaterialRequests: (p?: { projectId?: string; status?: string }) =>
    request<PaginatedResponse<any>>(
      `/procurement/material-requests${qs(p as any)}`,
    ),
  createMaterialRequest: (b: any) =>
    request<ApiResponse<any>>("/procurement/material-requests", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  approveMaterialRequest: (id: string) =>
    request<ApiResponse<any>>(`/procurement/material-requests/${id}/approve`, {
      method: "PATCH",
    }),
  getInventory: (p?: { search?: string; lowStock?: boolean }) =>
    request<ApiResponse<any[]>>(`/procurement/inventory${qs(p as any)}`),
  createInventoryItem: (b: any) =>
    request<ApiResponse<any>>("/procurement/inventory", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  updateInventoryItem: (id: string, b: any) =>
    request<ApiResponse<any>>(`/procurement/inventory/${id}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),

  // Projects extended
  getProjectDashboard: () => request<ApiResponse<any>>("/projects/dashboard"),
  getMilestones: (projectId: string) =>
    request<ApiResponse<any[]>>(`/projects/${projectId}/milestones`),
  createMilestone: (projectId: string, b: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/milestones`, {
      method: "POST",
      body: JSON.stringify(b),
    }),
  updateMilestone: (projectId: string, mid: string, b: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/milestones/${mid}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
  getIssues: (projectId: string, p?: { status?: string }) =>
    request<ApiResponse<any[]>>(`/projects/${projectId}/issues${qs(p as any)}`),
  createIssue: (projectId: string, b: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/issues`, {
      method: "POST",
      body: JSON.stringify(b),
    }),
  updateIssue: (projectId: string, iid: string, b: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/issues/${iid}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
  getDefects: (projectId: string, p?: { status?: string }) =>
    request<ApiResponse<any[]>>(
      `/projects/${projectId}/defects${qs(p as any)}`,
    ),
  createDefect: (projectId: string, b: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/defects`, {
      method: "POST",
      body: JSON.stringify(b),
    }),
  updateDefect: (projectId: string, did: string, b: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/defects/${did}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
  deleteDefect: (projectId: string, did: string) =>
    request<void>(`/projects/${projectId}/defects/${did}`, {
      method: "DELETE",
    }),
  getProjectCostReport: (projectId: string) =>
    request<ApiResponse<any>>(`/projects/${projectId}/cost-report`),
};

// ─── Additional API (v2 additions) ───────────────────────────────────────────

export const apiV2 = {
  // Auth
  refreshToken: () =>
    request<ApiResponse<{ accessToken: string; user: User }>>("/auth/refresh", {
      method: "POST",
    }),
  forgotPassword: (email: string) =>
    request<ApiResponse<{ message: string }>>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<ApiResponse<{ message: string }>>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  // Company profile
  getCompany: () => request<ApiResponse<Tenant>>("/company"),
  updateCompany: (body: Partial<Tenant>) =>
    request<ApiResponse<Tenant>>("/company", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Branches
  getBranches: () => request<ApiResponse<any[]>>("/company/branches"),
  createBranch: (body: any) =>
    request<ApiResponse<any>>("/company/branches", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateBranch: (id: string, body: any) =>
    request<ApiResponse<any>>(`/company/branches/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteBranch: (id: string) =>
    request<void>(`/company/branches/${id}`, { method: "DELETE" }),

  // SuperAdmin billing & analytics
  getBillingOverview: () =>
    request<ApiResponse<any>>("/superadmin/billing/overview"),
  getGrowthAnalytics: () =>
    request<ApiResponse<any[]>>("/superadmin/analytics/growth"),
  getActiveAnnouncements: () =>
    request<ApiResponse<any[]>>("/superadmin/announcements/active"),
  getAnnouncementsForTenant: () =>
    request<ApiResponse<any[]>>("/superadmin/announcements/tenant"),
  getAnnouncements: () =>
    request<ApiResponse<any[]>>("/superadmin/announcements"),
  createAnnouncement: (body: any) =>
    request<ApiResponse<any>>("/superadmin/announcements", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateAnnouncement: (id: string, body: any) =>
    request<ApiResponse<any>>(`/superadmin/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteAnnouncement: (id: string) =>
    request<void>(`/superadmin/announcements/${id}`, { method: "DELETE" }),

  // Finance
  getCOA: () => request<ApiResponse<any[]>>("/finance/coa"),
  createCOA: (body: any) =>
    request<ApiResponse<any>>("/finance/coa", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getJournalEntries: (p?: { page?: number }) =>
    request<PaginatedResponse<any>>(`/finance/journal-entries${qs(p as any)}`),
  createJournalEntry: (body: any) =>
    request<ApiResponse<any>>("/finance/journal-entries", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  postJournalEntry: (id: string) =>
    request<ApiResponse<any>>(`/finance/journal-entries/${id}/post`, {
      method: "POST",
    }),
  recordInvoicePayment: (invoiceId: string, body: any) =>
    request<ApiResponse<any>>(`/finance/invoices/${invoiceId}/payments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getInvoicePayments: (invoiceId: string) =>
    request<ApiResponse<any[]>>(`/finance/invoices/${invoiceId}/payments`),
  getPLReport: (startDate: string, endDate: string) =>
    request<ApiResponse<any>>(
      `/finance/reports/pl?startDate=${startDate}&endDate=${endDate}`,
    ),
  getCashflowReport: () =>
    request<ApiResponse<any>>("/finance/reports/cashflow"),
  getBalanceSheet: () =>
    request<ApiResponse<any>>("/finance/reports/balance-sheet"),

  // Procurement
  getRFQs: () => request<ApiResponse<any[]>>("/procurement/rfqs"),
  createRFQ: (body: any) =>
    request<ApiResponse<any>>("/procurement/rfqs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  awardRFQ: (id: string, vendorId: string) =>
    request<ApiResponse<any>>(`/procurement/rfqs/${id}/award`, {
      method: "POST",
      body: JSON.stringify({ vendorId }),
    }),
  getGRNs: (poId?: string) =>
    request<ApiResponse<any[]>>(
      `/procurement/grn${poId ? "?poId=" + poId : ""}`,
    ),
  createGRN: (body: any) =>
    request<ApiResponse<any>>("/procurement/grn", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  transferStock: (body: { id: string; qty: number; toLocation: string }) =>
    request<ApiResponse<any>>("/procurement/inventory/transfer", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // CRM
  getProposals: () => request<ApiResponse<any[]>>("/crm/proposals"),
  createProposal: (body: any) =>
    request<ApiResponse<any>>("/crm/proposals", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateProposalStatus: (id: string, status: string) =>
    request<ApiResponse<any>>(`/crm/proposals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getContracts: () => request<ApiResponse<any[]>>("/crm/contracts"),
  createContract: (body: any) =>
    request<ApiResponse<any>>("/crm/contracts", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signContract: (id: string) =>
    request<ApiResponse<any>>(`/crm/contracts/${id}/sign`, { method: "POST" }),
  getCrmAnalytics: () => request<ApiResponse<any>>("/crm/analytics"),
};

// ─── API v3 (clock-in/out, leave types, impersonation) ───────────────────────

export const apiV3 = {
  // Attendance clock-in/out
  clockIn: (employeeId: string, location?: string) =>
    request<ApiResponse<any>>("/hr/attendance/clock-in", {
      method: "POST",
      body: JSON.stringify({ employeeId, location }),
    }),
  clockOut: (employeeId: string, location?: string) =>
    request<ApiResponse<any>>("/hr/attendance/clock-out", {
      method: "POST",
      body: JSON.stringify({ employeeId, location }),
    }),

  // Leave types
  getLeaveTypes: () => request<ApiResponse<any[]>>("/hr/leave-types"),
  createLeaveType: (body: any) =>
    request<ApiResponse<any>>("/hr/leave-types", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateLeaveType: (id: string, body: any) =>
    request<ApiResponse<any>>(`/hr/leave-types/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Tenant impersonation (SuperAdmin)
  impersonateTenant: (tenantId: string) =>
    request<ApiResponse<{ accessToken: string; tenant: any; user: any }>>(
      `/superadmin/tenants/${tenantId}/impersonate`,
      { method: "POST" },
    ),

  // Project dashboard KPIs
  getProjectDashboard: () => request<ApiResponse<any>>("/projects/dashboard"),
};

// ─── API v4 (new features) ────────────────────────────────────────────────────

export const apiV4 = {
  // Projects — new endpoints
  getGantt: (projectId: string) =>
    request<ApiResponse<any>>(`/projects/${projectId}/gantt`),
  getSubcontracts: (projectId: string) =>
    request<ApiResponse<any[]>>(`/projects/${projectId}/subcontracts`),
  createSubcontract: (projectId: string, body: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/subcontracts`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateSubcontract: (projectId: string, id: string, body: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/subcontracts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getRisks: (projectId: string) =>
    request<ApiResponse<any[]>>(`/projects/${projectId}/risks`),
  createRisk: (projectId: string, body: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/risks`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateRisk: (projectId: string, id: string, body: any) =>
    request<ApiResponse<any>>(`/projects/${projectId}/risks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getTaskDeps: (projectId: string, taskId: string) =>
    request<ApiResponse<any[]>>(
      `/projects/${projectId}/tasks/${taskId}/dependencies`,
    ),
  createTaskDep: (projectId: string, taskId: string, body: any) =>
    request<ApiResponse<any>>(
      `/projects/${projectId}/tasks/${taskId}/dependencies`,
      { method: "POST", body: JSON.stringify(body) },
    ),

  // Finance — new endpoints
  getBalanceSheet: () =>
    request<ApiResponse<any>>("/finance/reports/balance-sheet"),
  getTaxRates: () => request<ApiResponse<any[]>>("/finance/tax-rates"),
  createTaxRate: (body: any) =>
    request<ApiResponse<any>>("/finance/tax-rates", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getExpenses: (p?: { employeeId?: string; status?: string; page?: number }) =>
    request<PaginatedResponse<any>>(`/finance/expenses${qs(p as any)}`),
  createExpense: (body: any) =>
    request<ApiResponse<any>>("/finance/expenses", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  approveExpense: (id: string) =>
    request<ApiResponse<any>>(`/finance/expenses/${id}/approve`, {
      method: "PATCH",
    }),
  rejectExpense: (id: string) =>
    request<ApiResponse<any>>(`/finance/expenses/${id}/reject`, {
      method: "PATCH",
    }),
  getBankTransactions: (bankAccountId: string) =>
    request<ApiResponse<any[]>>(
      `/finance/bank-accounts/${bankAccountId}/transactions`,
    ),
  createBankTransaction: (bankAccountId: string, body: any) =>
    request<ApiResponse<any>>(
      `/finance/bank-accounts/${bankAccountId}/transactions`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  reconcileTransaction: (
    bankAccountId: string,
    txId: string,
    invoiceId?: string,
  ) =>
    request<ApiResponse<any>>(
      `/finance/bank-accounts/${bankAccountId}/transactions/${txId}/reconcile`,
      { method: "PATCH", body: JSON.stringify({ invoiceId }) },
    ),
  getReconciliationSummary: (bankAccountId: string) =>
    request<ApiResponse<any>>(
      `/finance/bank-accounts/${bankAccountId}/reconciliation`,
    ),

  // HR — new endpoints
  generatePayslips: (runId: string) =>
    request<ApiResponse<any[]>>(`/hr/payroll/runs/${runId}/payslips`, {
      method: "POST",
    }),
  getEmployeePayslips: (employeeId: string) =>
    request<ApiResponse<any[]>>(`/hr/payroll/employees/${employeeId}/payslips`),
  getHRAnalytics: () => request<ApiResponse<any>>("/hr/analytics"),
  updatePayrollItem: (itemId: string, body: any) =>
    request<ApiResponse<any>>(`/hr/payroll/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Procurement — new endpoints
  getThreeWayMatches: () =>
    request<ApiResponse<any[]>>("/procurement/three-way-match"),
  createThreeWayMatch: (body: any) =>
    request<ApiResponse<any>>("/procurement/three-way-match", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getSpendAnalytics: () =>
    request<ApiResponse<any[]>>("/procurement/analytics/spend"),

  // Custom Roles
  getCustomRoles: () => request<ApiResponse<any[]>>("/users/roles"),
  createCustomRole: (body: any) =>
    request<ApiResponse<any>>("/users/roles", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateCustomRole: (id: string, body: any) =>
    request<ApiResponse<any>>(`/users/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// ─── API v5 (HSE PTW, Checklists) ────────────────────────────────────────────

export const apiV5 = {
  getHSEDashboard: () => request<ApiResponse<any>>("/hse/dashboard"),
  getPTWs: (p?: { projectId?: string; status?: string }) =>
    request<ApiResponse<any[]>>(`/hse/ptw${qs(p as any)}`),
  createPTW: (body: any) =>
    request<ApiResponse<any>>("/hse/ptw", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePTW: (id: string, body: any) =>
    request<ApiResponse<any>>(`/hse/ptw/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  closePTW: (id: string) =>
    request<ApiResponse<any>>(`/hse/ptw/${id}/close`, { method: "PATCH" }),
  getChecklists: (projectId?: string) =>
    request<ApiResponse<any[]>>(
      `/hse/checklists${projectId ? "?projectId=" + projectId : ""}`,
    ),
  createChecklist: (body: any) =>
    request<ApiResponse<any>>("/hse/checklists", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  submitChecklist: (id: string, body: any) =>
    request<ApiResponse<any>>(`/hse/checklists/${id}/submit`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
