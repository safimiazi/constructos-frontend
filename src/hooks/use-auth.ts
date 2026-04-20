'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError, User, setAccessToken, getAccessToken, clearTokens } from '@/lib/api';

const USER_QUERY_KEY = ['auth', 'user'];
const USER_STORAGE_KEY = 'cos_user';

function saveUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_STORAGE_KEY);
}

function loadUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    // Only return if we also have a token
    if (!getAccessToken()) return null;
    return JSON.parse(raw) as User;
  } catch { return null; }
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => loadUser(),
    initialData: loadUser,
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login({ email, password }),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken);
      saveUser(res.data.user);
      queryClient.setQueryData<User>(USER_QUERY_KEY, res.data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.logout().catch(() => {});
    },
    onSettled: () => {
      clearTokens();
      saveUser(null);
      queryClient.setQueryData(USER_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    login: (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    logout: () => logoutMutation.mutate(),
    loginError: loginMutation.error as ApiError | null,
    isLoginPending: loginMutation.isPending,
  };
}

export function useCurrentUser() {
  const { user, logout } = useAuth();
  return { user, logout };
}
