'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const K = { all: ['users'] as const };

export function useUsers(params?: { search?: string; role?: string; page?: number }) {
  return useQuery({ queryKey: [...K.all, params], queryFn: () => apiClient.getUsers(params) });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.inviteUser, onSuccess: () => qc.invalidateQueries({ queryKey: K.all }) });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof apiClient.updateUser>[1]) => apiClient.updateUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: K.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.deleteUser, onSuccess: () => qc.invalidateQueries({ queryKey: K.all }) });
}
