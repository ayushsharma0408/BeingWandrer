import type { BookingStatus, PassengerType } from '@best-in-flights-booking/shared-core';

export const ticketStatusCopy = (
  status: BookingStatus,
): { headline: string; detail: string; badge: string; tone: 'hold' | 'ok' | 'cancel' } => {
  if (status === 'CONFIRMED') {
    return {
      headline: 'Your e-ticket is confirmed',
      detail: 'Keep this itinerary handy for check-in. The airline may also send a separate ticket receipt.',
      badge: 'Ticketed',
      tone: 'ok',
    };
  }
  if (status === 'CANCELLED') {
    return {
      headline: 'This booking was cancelled',
      detail: 'This reservation is no longer valid for travel.',
      badge: 'Cancelled',
      tone: 'cancel',
    };
  }
  return {
    headline: 'Your reservation is on hold',
    detail: 'Seats are reserved. Our ticketing desk will issue the e-ticket and email it once confirmed.',
    badge: 'Ticketing pending',
    tone: 'hold',
  };
};

export const passengerTypeLabel = (type: PassengerType): string => {
  if (type === 'CHILD') {
    return 'Child';
  }
  if (type === 'INFANT') {
    return 'Infant';
  }
  return 'Adult';
};

export const formatIssuedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
