import type { FlightOffer, FlightSearchResult } from '@best-in-flights-booking/shared-core';
import { apiClient } from '@shared/api';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  currency: string;
  travelClass: string;
  flightMode: 'OneWay' | 'Return';
  page?: number;
  limit?: number;
}

export const searchFlightsApi = (params: FlightSearchParams): Promise<FlightSearchResult> => {
  const query = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    adults: String(params.adults),
    children: String(params.children),
    infants: String(params.infants),
    currency: params.currency,
    travelClass: params.travelClass,
    flightMode: params.flightMode,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 500),
  });
  if (params.flightMode === 'Return' && params.returnDate) {
    query.set('returnDate', params.returnDate);
  }
  return apiClient<FlightSearchResult>(`/api/v1/flights/search?${query.toString()}`);
};

export const getFlightOfferApi = (offerId: string): Promise<{ offer: FlightOffer }> => {
  return apiClient<{ offer: FlightOffer }>(`/api/v1/flights/offers/${encodeURIComponent(offerId)}`);
};
