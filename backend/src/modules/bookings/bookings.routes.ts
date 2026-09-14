import { Router } from 'express';
import { USER_ROLES } from '@best-in-flights-booking/shared-core';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { authenticate, optionalAuthenticate, roleGuard } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import { cancel, create, getOne, list } from './bookings.controller.js';
import { bookingIdParamsSchema, createBookingSchema, listBookingsQuerySchema } from './bookings.validation.js';

export const bookingsRouter = Router();

bookingsRouter.post('/', optionalAuthenticate, validate(createBookingSchema), asyncHandler(create));

bookingsRouter.get(
  '/',
  authenticate,
  roleGuard(USER_ROLES.USER, USER_ROLES.ADMIN),
  validate(listBookingsQuerySchema),
  asyncHandler(list),
);

bookingsRouter.get(
  '/:id',
  authenticate,
  roleGuard(USER_ROLES.USER, USER_ROLES.ADMIN),
  validate(bookingIdParamsSchema),
  asyncHandler(getOne),
);

bookingsRouter.patch(
  '/:id',
  authenticate,
  roleGuard(USER_ROLES.USER, USER_ROLES.ADMIN),
  validate(bookingIdParamsSchema),
  asyncHandler(cancel),
);
