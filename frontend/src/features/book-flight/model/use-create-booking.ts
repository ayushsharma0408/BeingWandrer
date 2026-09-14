import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createBookingApi } from '@entities/booking';
import { ApiClientError } from '@shared/api';
import { bookingFormSchema, passengerFullName, type BookingFormValues } from './booking-schema';

interface UseCreateBookingResult {
  submit: (offerId: string, values: BookingFormValues) => Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
}

export const useCreateBooking = (): UseCreateBookingResult => {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: createBookingApi,
    onSuccess: (data) => {
      navigate('/book/success', { state: { booking: data.booking } });
    },
  });

  const submit = async (offerId: string, values: BookingFormValues): Promise<void> => {
    const parsed = bookingFormSchema.parse(values);
    await mutation.mutateAsync({
      offerId,
      passengers: parsed.passengers.map((passenger) => ({
        fullName: passengerFullName(passenger),
        dateOfBirth: passenger.dateOfBirth,
        gender: passenger.gender,
        passengerType: passenger.passengerType,
      })),
      contact: parsed.contact,
      extras: parsed.extras,
      card: parsed.card,
    });
  };

  const formError =
    mutation.error instanceof ApiClientError
      ? mutation.error.message
      : mutation.error
        ? 'Unable to create booking'
        : null;

  return { submit, isSubmitting: mutation.isPending, formError };
};
