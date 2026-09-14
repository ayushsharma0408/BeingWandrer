import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { formatMoney } from '@shared/lib/flight-format';

export { formatMoney };

const ADD_PACK_PER_TRAVELLER = 499;

export const refundableFeeFor = (offer: FlightOffer): number => {
  const travellers = Math.max(offer.adults + offer.children + offer.infants, 1);
  return Number((offer.grandTotal / travellers / 6).toFixed(2));
};

export const addPackFeeFor = (offer: FlightOffer): number => {
  return ADD_PACK_PER_TRAVELLER * (offer.adults + offer.children);
};

export const checkoutTotalFor = (
  offer: FlightOffer,
  extras: { refundable: boolean; addPack: boolean },
): number => {
  return (
    offer.grandTotal +
    (extras.refundable ? refundableFeeFor(offer) : 0) +
    (extras.addPack ? addPackFeeFor(offer) : 0)
  );
};

export const formatClock = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};
