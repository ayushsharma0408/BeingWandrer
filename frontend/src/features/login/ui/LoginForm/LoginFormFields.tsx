import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@shared/ui';
import type { LoginFormValues } from '../../model/login-schema';

interface LoginFormFieldsProps {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
}

export const LoginFormFields = ({ register, errors }: LoginFormFieldsProps): JSX.Element => {
  return (
    <>
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
    </>
  );
};
