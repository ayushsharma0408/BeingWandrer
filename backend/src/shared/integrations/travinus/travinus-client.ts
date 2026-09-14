import { ERROR_CODES } from '@best-in-flights-booking/shared-core';
import { getEnv } from '../../../config/env.js';
import { AppError } from '../../errors/app-error.js';
import { createModuleLogger } from '../../logger/logger.js';
import { toTravinusDate } from './date.js';
import { mapTravinusSearchResults } from './map-offer.js';
import type { FlightOffer } from '@best-in-flights-booking/shared-core';

const log = createModuleLogger('travinus');

export interface TravinusSearchInput {
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
}

const readErrorMessage = (body: unknown, fallback: string): string => {
  if (!body || typeof body !== 'object') {
    return fallback;
  }
  const record = body as Record<string, unknown>;
  const nested = record.error;
  if (nested && typeof nested === 'object') {
    const message = (nested as Record<string, unknown>).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return fallback;
};

export const searchTravinusFlights = async (input: TravinusSearchInput): Promise<FlightOffer[]> => {
  const env = getEnv();
  const params = new URLSearchParams({
    PartnerId: env.TRAVINUS_PARTNER_ID,
    UseMock: String(env.TRAVINUS_USE_MOCK),
    OriginLocationCode: input.origin,
    DestinationLocationCode: input.destination,
    DepartureDate: toTravinusDate(input.departureDate),
    Adults: String(input.adults),
    Children: String(input.children),
    Infants: String(input.infants),
    CurrencyCode: input.currency,
    TravelClass: input.travelClass,
    FlightMode: input.flightMode,
  });
  if (input.flightMode === 'Return' && input.returnDate) {
    params.set('ReturnDate', toTravinusDate(input.returnDate));
  }

  const url = `${env.TRAVINUS_BASE_URL}/api/v2/flights/search?${params.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.TRAVINUS_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ClientId: env.TRAVINUS_CLIENT_ID,
        ClientSecret: env.TRAVINUS_CLIENT_SECRET,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const body: unknown = await response.json().catch(() => null);

    if (response.status === 429) {
      throw new AppError(429, ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Flight search is rate limited. Try again shortly.');
    }

    if (!response.ok) {
      log.warn({ status: response.status, partnerId: env.TRAVINUS_PARTNER_ID }, 'Travinus search failed');
      throw new AppError(
        502,
        ERROR_CODES.UPSTREAM_ERROR,
        readErrorMessage(body, 'Unable to search flights right now'),
      );
    }

    return mapTravinusSearchResults(body);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    log.warn({ err: err instanceof Error ? err.message : 'unknown' }, 'Travinus request failed');
    throw new AppError(502, ERROR_CODES.UPSTREAM_ERROR, 'Unable to search flights right now');
  } finally {
    clearTimeout(timer);
  }
};
