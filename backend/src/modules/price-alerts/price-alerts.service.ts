import { ERROR_CODES, type PriceAlertRecord } from '@best-in-flights-booking/shared-core';
import { requireDatabase } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import { createModuleLogger } from '../../shared/logger/logger.js';
import { PriceAlertModel, type PriceAlertDocument } from './price-alerts.model.js';
import type { CreatePriceAlertBody } from './price-alerts.validation.js';

const log = createModuleLogger('price-alerts');

const toRecord = (alert: PriceAlertDocument): PriceAlertRecord => {
  const record: PriceAlertRecord = {
    id: String(alert._id),
    origin: alert.origin,
    destination: alert.destination,
    departureDate: alert.departureDate,
    flightMode: alert.flightMode,
    currency: alert.currency,
    currentPrice: alert.currentPrice,
    createdAt: alert.createdAt.toISOString(),
  };
  if (alert.returnDate) {
    record.returnDate = alert.returnDate;
  }
  return record;
};

export const createPriceAlert = async (
  userId: string | null,
  input: CreatePriceAlertBody,
): Promise<PriceAlertRecord> => {
  requireDatabase();
  const returnDate = input.returnDate ?? '';
  const alert = await PriceAlertModel.findOneAndUpdate(
    {
      email: input.email.trim().toLowerCase(),
      origin: input.origin,
      destination: input.destination,
      departureDate: input.departureDate,
      returnDate,
      flightMode: input.flightMode,
    },
    {
      $set: {
        ...(userId ? { userId } : {}),
        currency: input.currency,
        currentPrice: input.currentPrice,
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (!alert) {
    throw new AppError(500, ERROR_CODES.INTERNAL_SERVER_ERROR, 'Price alert could not be saved');
  }

  log.info({ origin: input.origin, destination: input.destination }, 'Price alert saved');
  return toRecord(alert);
};
