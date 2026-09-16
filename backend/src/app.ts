import cors from 'cors';
import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { getEnv } from './config/env.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { flightsRouter } from './modules/flights/flights.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { priceAlertsRouter } from './modules/price-alerts/price-alerts.routes.js';
import {
  ADMIN_ROUTES,
  API_PREFIX,
  AUTH_ROUTES,
  BOOKING_ROUTES,
  FLIGHT_ROUTES,
  PRICE_ALERT_ROUTES,
} from './shared/constants/index.js';
import { errorHandler, notFoundHandler } from './shared/middleware/error-handler.js';

export const createApp = (): Express => {
  const env = getEnv();
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use('/health', healthRouter);
  app.use(`${API_PREFIX}${AUTH_ROUTES.ROOT}`, authRouter);
  app.use(`${API_PREFIX}${FLIGHT_ROUTES.ROOT}`, flightsRouter);
  app.use(`${API_PREFIX}${BOOKING_ROUTES.ROOT}`, bookingsRouter);
  app.use(`${API_PREFIX}${PRICE_ALERT_ROUTES.ROOT}`, priceAlertsRouter);
  app.use(`${API_PREFIX}${ADMIN_ROUTES.ROOT}`, adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
