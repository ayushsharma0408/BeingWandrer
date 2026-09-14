import { Router } from 'express';
import { FLIGHT_ROUTES } from '../../shared/constants/index.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { getOffer, search } from './flights.controller.js';
import { offerParamsSchema, searchFlightsSchema } from './flights.validation.js';

export const flightsRouter = Router();

flightsRouter.get(FLIGHT_ROUTES.SEARCH, validate(searchFlightsSchema), asyncHandler(search));
flightsRouter.get(FLIGHT_ROUTES.OFFER, validate(offerParamsSchema), asyncHandler(getOffer));
