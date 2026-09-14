import mongoose from 'mongoose';
import { ERROR_CODES } from '@best-in-flights-booking/shared-core';
import { AppError } from '../shared/errors/app-error.js';
import { getEnv } from './env.js';
import { logger } from '../shared/logger/logger.js';

export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const requireDatabase = (): void => {
  if (!isDatabaseConnected()) {
    throw new AppError(
      503,
      ERROR_CODES.UPSTREAM_ERROR,
      'MongoDB is not running. Start it to log in, save bookings, and set price alerts.',
    );
  }
};

export const connectDatabase = async (): Promise<boolean> => {
  const env = getEnv();
  try {
    await mongoose.connect(env.DATABASE_URL, { serverSelectionTimeoutMS: 3000 });
    logger.info({ module: 'database' }, 'MongoDB connected');
    return true;
  } catch (err) {
    logger.warn(
      { module: 'database', err: err instanceof Error ? err.message : 'unknown' },
      'MongoDB unavailable — flight search still works; login/booking needs Mongo',
    );
    return false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (isDatabaseConnected()) {
    await mongoose.disconnect();
  }
};
