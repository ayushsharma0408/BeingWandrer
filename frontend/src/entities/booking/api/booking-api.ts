import type {
  BookingCardInput,
  BookingContact,
  BookingExtras,
  BookingPassengerInput,
  BookingRecord,
} from '@best-in-flights-booking/shared-core';
import { apiClient } from '@shared/api';

export const createBookingApi = (body: {
  offerId: string;
  passengers: BookingPassengerInput[];
  contact: BookingContact;
  extras: BookingExtras;
  card: BookingCardInput;
}): Promise<{ booking: BookingRecord }> => {
  return apiClient<{ booking: BookingRecord }>('/api/v1/bookings', { method: 'POST', body });
};

export const listBookingsApi = (): Promise<BookingRecord[]> => {
  return apiClient<BookingRecord[]>('/api/v1/bookings');
};

export const getBookingApi = (id: string): Promise<{ booking: BookingRecord }> => {
  return apiClient<{ booking: BookingRecord }>(`/api/v1/bookings/${id}`);
};

export const cancelBookingApi = (id: string): Promise<{ booking: BookingRecord }> => {
  return apiClient<{ booking: BookingRecord }>(`/api/v1/bookings/${id}`, { method: 'PATCH' });
};
