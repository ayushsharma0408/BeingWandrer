import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUserApi, setUser } from '@entities/user';
import { ApiClientError } from '@shared/api';
import { setAccessToken } from '@shared/auth';
import { useAppDispatch } from '@shared/store';
import type { LoginFormValues } from './login-schema';

interface UseLoginOptions {
  onAuthenticated?: () => void;
}

interface UseLoginResult {
  submit: (values: LoginFormValues) => Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
}

export const useLogin = (options?: UseLoginOptions): UseLoginResult => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const mutation = useMutation({
    mutationFn: loginUserApi,
    onSuccess: (data) => {
      setAccessToken(data.token);
      dispatch(setUser(data.user));
      if (options?.onAuthenticated) {
        options.onAuthenticated();
        return;
      }
      navigate(from);
    },
  });

  const submit = async (values: LoginFormValues): Promise<void> => {
    await mutation.mutateAsync(values);
  };

  const formError =
    mutation.error instanceof ApiClientError ? mutation.error.message : mutation.error ? 'Login failed' : null;

  return { submit, isSubmitting: mutation.isPending, formError };
};
