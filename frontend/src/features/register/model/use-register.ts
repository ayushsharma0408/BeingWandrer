import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerUserApi, setUser } from '@entities/user';
import { ApiClientError } from '@shared/api';
import { setAccessToken } from '@shared/auth';
import { useAppDispatch } from '@shared/store';
import type { RegisterFormValues } from './register-schema';

interface UseRegisterOptions {
  onAuthenticated?: () => void;
}

interface UseRegisterResult {
  submit: (values: RegisterFormValues) => Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
}

export const useRegister = (options?: UseRegisterOptions): UseRegisterResult => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      registerUserApi({
        email: values.email,
        password: values.password,
        fullName: values.fullName?.trim() ? values.fullName.trim() : undefined,
      }),
    onSuccess: (data) => {
      setAccessToken(data.token);
      dispatch(setUser(data.user));
      if (options?.onAuthenticated) {
        options.onAuthenticated();
        return;
      }
      navigate('/');
    },
  });

  const submit = async (values: RegisterFormValues): Promise<void> => {
    await mutation.mutateAsync(values);
  };

  const formError =
    mutation.error instanceof ApiClientError
      ? mutation.error.message
      : mutation.error
        ? 'Registration failed'
        : null;

  return { submit, isSubmitting: mutation.isPending, formError };
};
