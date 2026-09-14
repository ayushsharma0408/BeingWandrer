import { BOOKING_STATUSES, type BookingStatus } from '@best-in-flights-booking/shared-core';

export const BOOKING_STATUS_TABS: Array<{ value: '' | BookingStatus; label: string }> = [
  { value: '', label: 'All' },
  { value: BOOKING_STATUSES.UNASSIGNED, label: 'Unassigned' },
  { value: BOOKING_STATUSES.ASSIGNED, label: 'Assigned' },
  { value: BOOKING_STATUSES.PROCESSING, label: 'Processing' },
  { value: BOOKING_STATUSES.FOLLOW_UP, label: 'Follow up' },
  { value: BOOKING_STATUSES.CONFIRMED, label: 'Confirmed' },
  { value: BOOKING_STATUSES.CANCELLED, label: 'Cancelled' },
  { value: BOOKING_STATUSES.FAILED, label: 'Failed' },
  { value: BOOKING_STATUSES.CHARGEBACK, label: 'Chargeback' },
];

export const BOOKING_STATUS_OPTIONS: BookingStatus[] = [
  BOOKING_STATUSES.PENDING,
  BOOKING_STATUSES.ASSIGNED,
  BOOKING_STATUSES.PROCESSING,
  BOOKING_STATUSES.FOLLOW_UP,
  BOOKING_STATUSES.CONFIRMED,
  BOOKING_STATUSES.CANCELLED,
  BOOKING_STATUSES.FAILED,
  BOOKING_STATUSES.CHARGEBACK,
];
