import { useMutation } from '@tanstack/react-query';
import { createPriceAlertApi, type CreatePriceAlertBody } from '@entities/price-alert';
import { ApiClientError } from '@shared/api';
import { priceAlertSchema, type PriceAlertFormValues } from './alert-schema';

interface UseCreatePriceAlertResult {
  submit: (values: PriceAlertFormValues, route: Omit<CreatePriceAlertBody, 'email'>) => Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
  isSuccess: boolean;
  reset: () => void;
}

export const useCreatePriceAlert = (): UseCreatePriceAlertResult => {
  const mutation = useMutation({
    mutationFn: createPriceAlertApi,
  });

  const submit = async (
    values: PriceAlertFormValues,
    route: Omit<CreatePriceAlertBody, 'email'>,
  ): Promise<void> => {
    const parsed = priceAlertSchema.parse(values);
    await mutation.mutateAsync({ ...route, email: parsed.email });
  };

  const formError =
    mutation.error instanceof ApiClientError
      ? mutation.error.message
      : mutation.error
        ? 'Unable to save this price alert'
        : null;

  return {
    submit,
    isSubmitting: mutation.isPending,
    formError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
