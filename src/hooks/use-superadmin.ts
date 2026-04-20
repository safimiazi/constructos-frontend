'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useSuperAdminStats() {
  return useQuery({ queryKey: ['superadmin-stats'], queryFn: apiClient.getSuperAdminStats });
}

export function useTenants(params?: { status?: string; search?: string; page?: number }) {
  return useQuery({ queryKey: ['tenants', params], queryFn: () => apiClient.getTenants(params) });
}

export function useTenant(id: string) {
  return useQuery({ queryKey: ['tenants', id], queryFn: () => apiClient.getTenant(id), enabled: !!id });
}

export function useUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof apiClient.updateTenantStatus>[1] }) =>
      apiClient.updateTenantStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function usePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: apiClient.getPlans });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.createPlan, onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }) });
}
