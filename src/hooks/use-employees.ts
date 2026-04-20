'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const K = { all: ['employees'] as const };

export function useEmployees(params?: { search?: string; page?: number }) {
  return useQuery({ queryKey: [...K.all, params], queryFn: () => apiClient.getEmployees(params) });
}

export function useEmployee(id: string) {
  return useQuery({ queryKey: [...K.all, id], queryFn: () => apiClient.getEmployee(id), enabled: !!id });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.createEmployee, onSuccess: () => qc.invalidateQueries({ queryKey: K.all }) });
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof apiClient.updateEmployee>[1]) => apiClient.updateEmployee(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: K.all }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.deleteEmployee, onSuccess: () => qc.invalidateQueries({ queryKey: K.all }) });
}

export function useAttendance(params?: { employeeId?: string; startDate?: string; endDate?: string }) {
  return useQuery({ queryKey: ['attendance', params], queryFn: () => apiClient.getAttendance(params) });
}

export function useLeaves(params?: { employeeId?: string; status?: string }) {
  return useQuery({ queryKey: ['leaves', params], queryFn: () => apiClient.getLeaves(params) });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.approveLeave, onSuccess: () => qc.invalidateQueries({ queryKey: ['leaves'] }) });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => apiClient.rejectLeave(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaves'] }),
  });
}

export function usePayrollRuns() {
  return useQuery({ queryKey: ['payroll-runs'], queryFn: apiClient.getPayrollRuns });
}

export function useCreatePayrollRun() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.createPayrollRun, onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-runs'] }) });
}

export function usePayrollItems(runId: string) {
  return useQuery({ queryKey: ['payroll-items', runId], queryFn: () => apiClient.getPayrollItems(runId), enabled: !!runId });
}
