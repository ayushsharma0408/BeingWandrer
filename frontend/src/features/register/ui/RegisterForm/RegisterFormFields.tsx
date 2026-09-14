import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@shared/ui';
import type { RegisterFormValues } from '../../model/register-schema';

interface RegisterFormFieldsProps {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
}

export const RegisterFormFields = ({ register, errors }: RegisterFormFieldsProps): JSX.Element => {
  return (
    <>
      <Input label="Full name" type="text" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
    </>
  );
};
