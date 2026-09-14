import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@shared/ui';
import type { PriceAlertFormValues } from '../../model/alert-schema';

interface AlertFormFieldsProps {
  register: UseFormRegister<PriceAlertFormValues>;
  errors: FieldErrors<PriceAlertFormValues>;
}

export const AlertFormFields = ({ register, errors }: AlertFormFieldsProps): JSX.Element => {
  return (
    <Input
      label="Email *"
      type="email"
      autoComplete="email"
      error={errors.email?.message}
      {...register('email')}
    />
  );
};
