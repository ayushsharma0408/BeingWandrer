import { Router } from 'express';
import { STAFF_ROLES } from '@best-in-flights-booking/shared-core';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { authenticate, roleGuard } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  activityList,
  assignableStaff,
  bookingsAssign,
  bookingsConvert,
  bookingsGet,
  bookingsLifecycle,
  bookingsList,
  bookingsManual,
  bookingsStatus,
  customerCreate,
  customerGet,
  customerList,
  customerUpdate,
  dashboard,
  inquiriesAssign,
  inquiriesCreate,
  inquiriesList,
  markupsCreate,
  markupsDelete,
  markupsGet,
  markupsList,
  markupsUpdate,
  offersCreate,
  offersGet,
  offersList,
  offersUpdate,
  publicOffersGetBySlug,
  publicOffersList,
  routesCreate,
  routesDelete,
  routesGet,
  routesList,
  routesUpdate,
  searchesList,
  sessionsList,
  staffCreate,
  staffDelete,
  staffGet,
  staffList,
  staffUpdate,
} from './admin.controller.js';
import {
  assignBookingSchema,
  bookingManualSchema,
  bookingStatusSchema,
  bookingsQuerySchema,
  createCustomerSchema,
  createInquirySchema,
  createStaffSchema,
  inquiriesQuerySchema,
  listQuerySchema,
  markupBodySchema,
  offerBodySchema,
  publicOffersQuerySchema,
  routeBodySchema,
  routesQuerySchema,
  searchRecordsQuerySchema,
  sessionsQuerySchema,
  staffListQuerySchema,
  updateCustomerSchema,
  updateMarkupBodySchema,
  updateOfferBodySchema,
  updateRouteBodySchema,
  updateStaffSchema,
} from './admin.validation.js';

export const adminRouter = Router();
const staffOnly = [authenticate, roleGuard(...STAFF_ROLES)] as const;

adminRouter.get('/dashboard', ...staffOnly, asyncHandler(dashboard));

adminRouter.get('/staff', ...staffOnly, validate(staffListQuerySchema), asyncHandler(staffList));
adminRouter.post('/staff', ...staffOnly, validate(createStaffSchema), asyncHandler(staffCreate));
adminRouter.get('/staff/assignable', ...staffOnly, asyncHandler(assignableStaff));
adminRouter.get('/staff/:id', ...staffOnly, asyncHandler(staffGet));
adminRouter.patch('/staff/:id', ...staffOnly, validate(updateStaffSchema), asyncHandler(staffUpdate));
adminRouter.delete('/staff/:id', ...staffOnly, asyncHandler(staffDelete));

adminRouter.get('/customers', ...staffOnly, validate(listQuerySchema), asyncHandler(customerList));
adminRouter.post('/customers', ...staffOnly, validate(createCustomerSchema), asyncHandler(customerCreate));
adminRouter.get('/customers/:id', ...staffOnly, asyncHandler(customerGet));
adminRouter.patch('/customers/:id', ...staffOnly, validate(updateCustomerSchema), asyncHandler(customerUpdate));

adminRouter.get('/sessions', ...staffOnly, validate(sessionsQuerySchema), asyncHandler(sessionsList));
adminRouter.get('/activity', ...staffOnly, validate(listQuerySchema), asyncHandler(activityList));

adminRouter.get('/offers', ...staffOnly, validate(listQuerySchema), asyncHandler(offersList));
adminRouter.post('/offers', ...staffOnly, validate(offerBodySchema), asyncHandler(offersCreate));
adminRouter.get('/offers/:id', ...staffOnly, asyncHandler(offersGet));
adminRouter.patch('/offers/:id', ...staffOnly, validate(updateOfferBodySchema), asyncHandler(offersUpdate));

adminRouter.get('/search-records', ...staffOnly, validate(searchRecordsQuerySchema), asyncHandler(searchesList));

adminRouter.get('/inquiries', ...staffOnly, validate(inquiriesQuerySchema), asyncHandler(inquiriesList));
adminRouter.patch('/inquiries/:id/assign', ...staffOnly, asyncHandler(inquiriesAssign));

adminRouter.get('/bookings', ...staffOnly, validate(bookingsQuerySchema), asyncHandler(bookingsList));
adminRouter.get('/bookings/:id', ...staffOnly, asyncHandler(bookingsGet));
adminRouter.get('/bookings/:id/lifecycle', ...staffOnly, asyncHandler(bookingsLifecycle));
adminRouter.patch('/bookings/:id/assign', ...staffOnly, validate(assignBookingSchema), asyncHandler(bookingsAssign));
adminRouter.patch('/bookings/:id/status', ...staffOnly, validate(bookingStatusSchema), asyncHandler(bookingsStatus));
adminRouter.patch('/bookings/:id/manual', ...staffOnly, validate(bookingManualSchema), asyncHandler(bookingsManual));
adminRouter.post('/bookings/:id/convert-customer', ...staffOnly, asyncHandler(bookingsConvert));

adminRouter.get('/routes', ...staffOnly, validate(routesQuerySchema), asyncHandler(routesList));
adminRouter.post('/routes', ...staffOnly, validate(routeBodySchema), asyncHandler(routesCreate));
adminRouter.get('/routes/:id', ...staffOnly, asyncHandler(routesGet));
adminRouter.patch('/routes/:id', ...staffOnly, validate(updateRouteBodySchema), asyncHandler(routesUpdate));
adminRouter.delete('/routes/:id', ...staffOnly, asyncHandler(routesDelete));
adminRouter.get('/routes/:id/markups', ...staffOnly, validate(listQuerySchema), asyncHandler(markupsList));
adminRouter.post('/routes/:id/markups', ...staffOnly, validate(markupBodySchema), asyncHandler(markupsCreate));

adminRouter.get('/markups/:markupId', ...staffOnly, asyncHandler(markupsGet));
adminRouter.patch('/markups/:markupId', ...staffOnly, validate(updateMarkupBodySchema), asyncHandler(markupsUpdate));
adminRouter.delete('/markups/:markupId', ...staffOnly, asyncHandler(markupsDelete));

export const offerInquiryPublicRouter = Router();
offerInquiryPublicRouter.post('/', validate(createInquirySchema), asyncHandler(inquiriesCreate));

export const offersPublicRouter = Router();
offersPublicRouter.get('/', validate(publicOffersQuerySchema), asyncHandler(publicOffersList));
offersPublicRouter.get('/:slug', asyncHandler(publicOffersGetBySlug));
