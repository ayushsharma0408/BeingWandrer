import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { optionalAuthenticate } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import { create } from './price-alerts.controller.js';
import { createPriceAlertSchema } from './price-alerts.validation.js';

export const priceAlertsRouter = Router();

priceAlertsRouter.post('/', optionalAuthenticate, validate(createPriceAlertSchema), asyncHandler(create));
