import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { durationMinutes, hourOf } from '@shared/lib/flight-format';

export type SortKey = 'cheapest' | 'best' | 'fastest';

export interface FlightFiltersState {
  stops: number[];
  airlines: string[];
  minPrice: number;
  maxPrice: number;
  minDuration: number;
  maxDuration: number;
  departFrom: number;
  departTo: number;
  carryOnOnly: boolean;
  checkedBagOnly: boolean;
}

export interface FilterBounds {
  minPrice: number;
  maxPrice: number;
  minDuration: number;
  maxDuration: number;
}

export const uniqueAirlines = (offers: FlightOffer[]): string[] => {
  return [...new Set(offers.map((offer) => offer.departing.departure.carrierName))].sort();
};

export const tripMinutes = (offer: FlightOffer): number => {
  return durationMinutes(offer.departing.duration) + (offer.returning ? durationMinutes(offer.returning.duration) : 0);
};

export const priceBounds = (offers: FlightOffer[]): { min: number; max: number } => {
  if (offers.length === 0) {
    return { min: 0, max: 0 };
  }
  const prices = offers.map((offer) => offer.grandTotal);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

export const durationBounds = (offers: FlightOffer[]): { min: number; max: number } => {
  if (offers.length === 0) {
    return { min: 0, max: 0 };
  }
  const values = offers.map((offer) => tripMinutes(offer));
  return { min: Math.min(...values), max: Math.max(...values) };
};

export const filterBounds = (offers: FlightOffer[]): FilterBounds => {
  const prices = priceBounds(offers);
  const durations = durationBounds(offers);
  return {
    minPrice: prices.min,
    maxPrice: prices.max,
    minDuration: durations.min,
    maxDuration: durations.max,
  };
};

export const lowestPriceFor = (offers: FlightOffer[], predicate: (offer: FlightOffer) => boolean): number | null => {
  const matched = offers.filter(predicate).map((offer) => offer.grandTotal);
  return matched.length ? Math.min(...matched) : null;
};

export const emptyFilters = (offers: FlightOffer[]): FlightFiltersState => {
  const bounds = filterBounds(offers);
  return {
    stops: [],
    airlines: [],
    minPrice: bounds.minPrice,
    maxPrice: bounds.maxPrice,
    minDuration: bounds.minDuration,
    maxDuration: bounds.maxDuration,
    departFrom: 0,
    departTo: 24,
    carryOnOnly: false,
    checkedBagOnly: false,
  };
};

export const applyFlightFilters = (
  offers: FlightOffer[],
  filters: FlightFiltersState,
  sort: SortKey,
): FlightOffer[] => {
  const filtered = offers.filter((offer) => {
    const stops = offer.departing.numberOfStops >= 2 ? 2 : offer.departing.numberOfStops;
    const minutes = tripMinutes(offer);
    const hour = hourOf(offer.departing.departure.at);
    const stopOk = filters.stops.length === 0 || filters.stops.includes(stops);
    const airlineOk = filters.airlines.length === 0 || filters.airlines.includes(offer.departing.departure.carrierName);
    const priceOk = offer.grandTotal >= filters.minPrice && offer.grandTotal <= filters.maxPrice + 0.01;
    const durationOk = minutes >= filters.minDuration && minutes <= filters.maxDuration;
    const timeOk = hour >= filters.departFrom && hour <= filters.departTo;
    const carryOk = !filters.carryOnOnly || offer.baggage.carryOnBags.quantity >= 1;
    const checkOk = !filters.checkedBagOnly || offer.baggage.checkedInBags.quantity >= 1;
    return stopOk && airlineOk && priceOk && durationOk && timeOk && carryOk && checkOk;
  });

  return [...filtered].sort((left, right) => {
    const leftMinutes = tripMinutes(left);
    const rightMinutes = tripMinutes(right);
    const leftStops = left.departing.numberOfStops + (left.returning?.numberOfStops ?? 0);
    const rightStops = right.departing.numberOfStops + (right.returning?.numberOfStops ?? 0);
    if (sort === 'fastest') {
      return leftMinutes - rightMinutes || left.grandTotal - right.grandTotal;
    }
    if (sort === 'best') {
      return (
        left.grandTotal * leftMinutes * (1 + leftStops) - right.grandTotal * rightMinutes * (1 + rightStops) ||
        left.grandTotal - right.grandTotal
      );
    }
    return left.grandTotal - right.grandTotal || leftMinutes - rightMinutes;
  });
};

export const sortSummaries = (
  offers: FlightOffer[],
): Record<SortKey, { price: number; minutes: number } | null> => {
  if (offers.length === 0) {
    return { cheapest: null, best: null, fastest: null };
  }
  const cheapest = [...offers].sort((a, b) => a.grandTotal - b.grandTotal || tripMinutes(a) - tripMinutes(b))[0];
  const fastest = [...offers].sort((a, b) => tripMinutes(a) - tripMinutes(b) || a.grandTotal - b.grandTotal)[0];
  const best = [...offers].sort((a, b) => {
    const leftStops = a.departing.numberOfStops + (a.returning?.numberOfStops ?? 0);
    const rightStops = b.departing.numberOfStops + (b.returning?.numberOfStops ?? 0);
    return (
      a.grandTotal * tripMinutes(a) * (1 + leftStops) - b.grandTotal * tripMinutes(b) * (1 + rightStops) ||
      a.grandTotal - b.grandTotal
    );
  })[0];
  return {
    cheapest: { price: cheapest.grandTotal, minutes: tripMinutes(cheapest) },
    best: { price: best.grandTotal, minutes: tripMinutes(best) },
    fastest: { price: fastest.grandTotal, minutes: tripMinutes(fastest) },
  };
};
