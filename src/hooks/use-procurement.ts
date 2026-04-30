'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useVendors(params?: { search?: string; page?: number }) {
  return useQuery({ queryKey: ['vendors', params], queryFn: () => apiClient.getVendors(params) });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.createVendor, onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }) });
}

export function useUpdateVendor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof apiClient.updateVendor>[1]) => apiClient.updateVendor(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.deleteVendor, onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }) });
}

export function usePurchaseOrders(params?: { status?: string; page?: number }) {
  return useQuery({ queryKey: ['purchase-orders', params], queryFn: () => apiClient.getPurchaseOrders(params) });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.createPurchaseOrder, onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }) });
}

export function useUpdatePurchaseOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof apiClient.updatePurchaseOrder>[1]) => apiClient.updatePurchaseOrder(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
}

export function useDeletePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.deletePurchaseOrder, onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }) });
}
