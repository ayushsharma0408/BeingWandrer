import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { isDatabaseConnected } from '../../config/database.js';
import { CachedOfferModel } from './flights.model.js';

const OFFER_TTL_MS = 20 * 60 * 1000;
const memoryCache = new Map<string, { offer: FlightOffer; expiresAt: number }>();

export const putOfferCache = (offer: FlightOffer): void => {
  memoryCache.set(offer.offerId, { offer, expiresAt: Date.now() + OFFER_TTL_MS });
};

export const getOfferCache = (offerId: string): FlightOffer | undefined => {
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

export const cacheOffers = async (offers: FlightOffer[]): Promise<void> => {
  const expiresAt = new Date(Date.now() + OFFER_TTL_MS);
  offers.forEach(putOfferCache);

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

export const clearOfferCache = async (): Promise<void> => {
  memoryCache.clear();
  if (!isDatabaseConnected()) {
    return;
  }
  await CachedOfferModel.deleteMany({});
};
