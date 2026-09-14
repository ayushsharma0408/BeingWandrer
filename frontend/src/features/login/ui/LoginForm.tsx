import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLogin } from '../model/use-login';
import { loginSchema, type LoginFormValues } from '../model/login-schema';
import { LoginFormFields } from './LoginForm/LoginFormFields';
import { LoginSubmitButton } from './LoginForm/LoginSubmitButton';

interface LoginFormProps {
  onAuthenticated?: () => void;
}

export const LoginForm = ({ onAuthenticated }: LoginFormProps): JSX.Element => {
  const { submit, isSubmitting, formError } = useLogin(onAuthenticated ? { onAuthenticated } : undefined);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form className="stack" onSubmit={handleSubmit(submit)} noValidate>
      <LoginFormFields register={register} errors={errors} />
      {formError ? <p className="field-error">{formError}</p> : null}
      <LoginSubmitButton isSubmitting={isSubmitting} />
    </form>
  );
};
