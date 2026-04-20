'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const K = { all: ['invoices'] as const };

export function useInvoices(params?: { status?: string; type?: string; page?: number }) {
  return useQuery({ queryKey: [...K.all, params], queryFn: () => apiClient.getInvoices(params) });
}

export function useInvoice(id: string) {
  return useQuery({ queryKey: [...K.all, id], queryFn: () => apiClient.getInvoice(id), enabled: !!id });
}

export function useInvoiceStats() {
  return useQuery({ queryKey: ['invoice-stats'], queryFn: apiClient.getInvoiceStats });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.createInvoice, onSuccess: () => qc.invalidateQueries({ queryKey: K.all }) });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof apiClient.updateInvoiceStatus>[1] }) =>
      apiClient.updateInvoiceStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: K.all }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.deleteInvoice, onSuccess: () => qc.invalidateQueries({ queryKey: K.all }) });
}
