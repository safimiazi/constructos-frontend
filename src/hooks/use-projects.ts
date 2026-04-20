'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const projectKeys = {
  all: ['projects'] as const,
  list: (p?: object) => [...projectKeys.all, 'list', p] as const,
  detail: (id: string) => [...projectKeys.all, id] as const,
  tasks: (id: string) => [...projectKeys.all, id, 'tasks'] as const,
  logs: (id: string) => [...projectKeys.all, id, 'logs'] as const,
};

export function useProjects(params?: { status?: string; page?: number }) {
  return useQuery({ queryKey: projectKeys.list(params), queryFn: () => apiClient.getProjects(params) });
}

export function useProject(id: string) {
  return useQuery({ queryKey: projectKeys.detail(id), queryFn: () => apiClient.getProject(id), enabled: !!id });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.createProject, onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }) });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof apiClient.updateProject>[1]) => apiClient.updateProject(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiClient.deleteProject, onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }) });
}

export function useTasks(projectId: string) {
  return useQuery({ queryKey: projectKeys.tasks(projectId), queryFn: () => apiClient.getTasks(projectId), enabled: !!projectId });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof apiClient.createTask>[1]) => apiClient.createTask(projectId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.tasks(projectId) }),
  });
}

export function useUpdateTask(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof apiClient.updateTask>[2]) => apiClient.updateTask(projectId, taskId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.tasks(projectId) }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiClient.deleteTask(projectId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.tasks(projectId) }),
  });
}

export function useDailyLogs(projectId: string) {
  return useQuery({ queryKey: projectKeys.logs(projectId), queryFn: () => apiClient.getDailyLogs(projectId), enabled: !!projectId });
}

export function useCreateDailyLog(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof apiClient.createDailyLog>[1]) => apiClient.createDailyLog(projectId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.logs(projectId) }),
  });
}
