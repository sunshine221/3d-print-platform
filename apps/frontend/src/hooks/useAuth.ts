'use client';

import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import type { AuthUser, LoginRequest, RegisterRequest } from '@3d-print/types';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '@/lib/api';

export function useAuth() {
  const router = useRouter();

  const {
    data: user,
    error,
    isLoading,
  } = useSWR<AuthUser | null>('auth-user', getMe, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const login = async (data: LoginRequest) => {
    await apiLogin(data);
    const me = await getMe();
    await mutate('auth-user', me, false);
    router.refresh();
  };

  const register = async (data: RegisterRequest) => {
    await apiRegister(data);
    const me = await getMe();
    await mutate('auth-user', me, false);
    router.refresh();
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    await mutate('auth-user', null, false);
    router.push('/');
    router.refresh();
  };

  return {
    user: user ?? null,
    isLoading,
    isLoggedIn: !!user && !error,
    isError: !!error,
    login,
    register,
    logout,
  };
}
