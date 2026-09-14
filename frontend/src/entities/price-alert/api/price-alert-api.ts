import type { FlightMode, PriceAlertRecord } from '@best-in-flights-booking/shared-core';
import { apiClient } from '@shared/api';

export interface CreatePriceAlertBody {
  email: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  flightMode: FlightMode;
  currency: string;
  currentPrice: number;
}

export const createPriceAlertApi = (body: CreatePriceAlertBody): Promise<{ alert: PriceAlertRecord }> => {
  return apiClient<{ alert: PriceAlertRecord }>('/api/v1/price-alerts', { method: 'POST', body });
};
