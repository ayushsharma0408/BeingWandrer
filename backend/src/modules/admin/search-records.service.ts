import { META_SEARCH_CHANNELS, type AdminSearchRecord } from '@best-in-flights-booking/shared-core';
import { isDatabaseConnected, requireDatabase } from '../../config/database.js';
import { createModuleLogger } from '../../shared/logger/logger.js';
import { SearchRecordModel } from './admin.models.js';

const log = createModuleLogger('search-records');

export const recordFlightSearch = async (input: {
  userId?: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  flightMode: 'OneWay' | 'Return';
  travelClass: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  adults: number;
  children: number;
  infants: number;
  ipAddress: string;
}): Promise<void> => {
  if (!isDatabaseConnected()) {
    return;
  }
  try {
    await SearchRecordModel.create({
      ...(input.userId ? { userId: input.userId } : {}),
      origin: input.origin,
      destination: input.destination,
      departureDate: input.departureDate,
      ...(input.returnDate ? { returnDate: input.returnDate } : {}),
      flightMode: input.flightMode,
      travelClass: input.travelClass,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      metaSearch: META_SEARCH_CHANNELS.D2C,
      ipAddress: input.ipAddress,
    });
  } catch (err) {
    log.warn({ err }, 'Failed to persist search record');
  }
};

export const listSearchRecords = async (input: {
  page: number;
  limit: number;
  userId?: string;
  from?: string;
  to?: string;
}): Promise<{ items: AdminSearchRecord[]; total: number }> => {
  requireDatabase();
  const filter: Record<string, unknown> = { metaSearch: META_SEARCH_CHANNELS.D2C };
  if (input.userId) {
    filter.userId = input.userId;
  }
  if (input.from || input.to) {
    const createdAt: Record<string, Date> = {};
    if (input.from) {
      createdAt.$gte = new Date(`${input.from}T00:00:00.000Z`);
    }
    if (input.to) {
      createdAt.$lte = new Date(`${input.to}T23:59:59.999Z`);
    }
    filter.createdAt = createdAt;
  }

  const [docs, total] = await Promise.all([
    SearchRecordModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit),
    SearchRecordModel.countDocuments(filter),
  ]);

  return {
    total,
    items: docs.map((doc) => {
      const item: AdminSearchRecord = {
        id: String(doc._id),
        origin: doc.origin,
        destination: doc.destination,
        departureDate: doc.departureDate,
        flightMode: doc.flightMode,
        travelClass: doc.travelClass,
        adults: doc.adults,
        children: doc.children,
        infants: doc.infants,
        metaSearch: doc.metaSearch,
        ipAddress: doc.ipAddress,
        createdAt: doc.createdAt.toISOString(),
      };
      if (doc.userId) {
        item.userId = String(doc.userId);
      }
      if (doc.returnDate) {
        item.returnDate = doc.returnDate;
      }
      return item;
    }),
  };
};
