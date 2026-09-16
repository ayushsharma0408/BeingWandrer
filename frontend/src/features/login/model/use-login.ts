import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { isStaffRole } from '@best-in-flights-booking/shared-core';
import { loginUserApi, setUser } from '@entities/user';
import { ApiClientError } from '@shared/api';
import { setAccessToken } from '@shared/auth';
import { useAppDispatch } from '@shared/store';
import type { LoginFormValues } from './login-schema';

interface UseLoginOptions {
  onAuthenticated?: () => void;
  portal?: 'admin' | 'consumer';
}

interface UseLoginResult {
  submit: (values: LoginFormValues) => Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
}

const adminPath = (from: string): string => {
  return from.startsWith('/admin') ? from : '/admin';
};

export const useLogin = (options?: UseLoginOptions): UseLoginResult => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const portal = options?.portal ?? 'consumer';
  const from = (location.state as { from?: string } | null)?.from ?? (portal === 'admin' ? '/admin' : '/');

  const mutation = useMutation({
    mutationFn: loginUserApi,
    onSuccess: (data) => {
      setAccessToken(data.token);
      dispatch(setUser(data.user));
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      const enterAdmin =
        (portal === 'admin' || isStaffRole(data.user.role)) && !location.pathname.startsWith('/book');
      if (enterAdmin) {
        options?.onAuthenticated?.();
        navigate(adminPath(from), { replace: true });
        return;
      }
      if (options?.onAuthenticated) {
        options.onAuthenticated();
        return;
      }
      navigate(from);
    },
  });

  const submit = async (values: LoginFormValues): Promise<void> => {
    await mutation.mutateAsync(portal === 'admin' ? { ...values, portal: 'admin' } : values);
  };

  const formError =
    mutation.error instanceof ApiClientError ? mutation.error.message : mutation.error ? 'Login failed' : null;

  return { submit, isSubmitting: mutation.isPending, formError };
};
