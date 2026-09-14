import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registerSchema, type RegisterFormValues } from '../model/register-schema';
import { useRegister } from '../model/use-register';
import { RegisterFormFields } from './RegisterForm/RegisterFormFields';
import { RegisterSubmitButton } from './RegisterForm/RegisterSubmitButton';

interface RegisterFormProps {
  onAuthenticated?: () => void;
}

export const RegisterForm = ({ onAuthenticated }: RegisterFormProps): JSX.Element => {
  const { submit, isSubmitting, formError } = useRegister(onAuthenticated ? { onAuthenticated } : undefined);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  return (
    <form className="stack" onSubmit={handleSubmit(submit)} noValidate>
      <RegisterFormFields register={register} errors={errors} />
      {formError ? <p className="field-error">{formError}</p> : null}
      <RegisterSubmitButton isSubmitting={isSubmitting} />
    </form>
  );
};
