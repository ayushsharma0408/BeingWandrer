import type { BookingStatus, PassengerType } from '@best-in-flights-booking/shared-core';

export const ticketStatusCopy = (
  status: BookingStatus,
): { headline: string; detail: string; badge: string; tone: 'hold' | 'ok' | 'cancel' } => {
  if (status === 'CONFIRMED') {
    return {
      headline: 'E-ticket is confirmed',
      detail: 'Keep this itinerary for check-in. The airline may also send a separate ticket receipt.',
      badge: 'Ticketed',
      tone: 'ok',
    };
  }
  if (status === 'CANCELLED' || status === 'FAILED' || status === 'CHARGEBACK') {
    return {
      headline: status === 'CHARGEBACK' ? 'This booking is in chargeback' : `This booking was ${status.toLowerCase()}`,
      detail: 'This reservation is not valid for travel until operations restore it.',
      badge: status.replaceAll('_', ' '),
      tone: 'cancel',
    };
  }
  const labels: Partial<Record<BookingStatus, string>> = {
    PENDING: 'Ticketing pending',
    UNASSIGNED: 'Unassigned',
    ASSIGNED: 'Assigned',
    PROCESSING: 'Processing',
    FOLLOW_UP: 'Follow up',
  };
  return {
    headline: 'Reservation is on hold',
    detail: 'Seats are reserved. Issue the e-ticket from this desk once the airline confirms.',
    badge: labels[status] ?? status.replaceAll('_', ' '),
    tone: 'hold',
  };
};

export const genderLabel = (gender?: string): string => {
  if (!gender) {
    return '—';
  }
  return `${gender.charAt(0)}${gender.slice(1).toLowerCase()}`;
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
