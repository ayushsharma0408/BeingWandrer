import { ERROR_CODES, PAGINATION_DEFAULTS, type FlightOffer } from '@best-in-flights-booking/shared-core';
import { isDatabaseConnected } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import { searchTravinusFlights } from '../../shared/integrations/travinus/travinus-client.js';
import { CachedOfferModel } from './flights.model.js';
import type { SearchFlightsQuery } from './flights.validation.js';

const OFFER_TTL_MS = 20 * 60 * 1000;
const memoryCache = new Map<string, { offer: FlightOffer; expiresAt: number }>();

const putMemory = (offer: FlightOffer): void => {
  memoryCache.set(offer.offerId, { offer, expiresAt: Date.now() + OFFER_TTL_MS });
};

const getMemory = (offerId: string): FlightOffer | undefined => {
  const cached = memoryCache.get(offerId);
  if (!cached) {
    return undefined;
  }
  if (cached.expiresAt < Date.now()) {
    memoryCache.delete(offerId);
    return undefined;
  }
  return cached.offer;
};

const cacheOffers = async (offers: FlightOffer[]): Promise<void> => {
  const expiresAt = new Date(Date.now() + OFFER_TTL_MS);
  offers.forEach(putMemory);

  if (!isDatabaseConnected()) {
    return;
  }

  await Promise.all(
    offers.map((offer) =>
      CachedOfferModel.findOneAndUpdate(
        { offerId: offer.offerId },
        { offerId: offer.offerId, snapshot: offer, expiresAt },
        { upsert: true },
      ),
    ),
  );
};

export const searchFlights = async (
  query: SearchFlightsQuery,
): Promise<{ offers: FlightOffer[]; total: number; page: number; limit: number }> => {
  const offers = await searchTravinusFlights({
    origin: query.origin,
    destination: query.destination,
    departureDate: query.departureDate,
    returnDate: query.returnDate,
    adults: query.adults,
    children: query.children,
    infants: query.infants,
    currency: query.currency,
    travelClass: query.travelClass,
    flightMode: query.flightMode,
  });

  await cacheOffers(offers);

  const page = query.page;
  const limit = Math.min(query.limit, PAGINATION_DEFAULTS.MAX_LIMIT);
  const start = (page - 1) * limit;
  return {
    offers: offers.slice(start, start + limit),
    total: offers.length,
    page,
    limit,
  };
};

export const getCachedOffer = async (offerId: string): Promise<FlightOffer> => {
  const fromMemory = getMemory(offerId);
  if (fromMemory) {
    return fromMemory;
  }

  if (isDatabaseConnected()) {
    const cached = await CachedOfferModel.findOne({ offerId, expiresAt: { $gt: new Date() } });
    if (cached) {
      putMemory(cached.snapshot);
      return cached.snapshot;
    }
  }

  throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Flight offer expired. Search again.');
};
