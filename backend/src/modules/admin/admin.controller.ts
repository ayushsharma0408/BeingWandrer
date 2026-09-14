import type { Request, Response } from 'express';
import type { BookingStatus } from '@best-in-flights-booking/shared-core';
import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/middleware/error-handler.js';
import { listAccessRecords, listActivityLogs } from './activity.service.js';
import {
  assignBooking,
  changeBookingStatus,
  convertBookingToCustomer,
  getAdminBooking,
  listAdminBookings,
  listAssignableStaff,
  listBookingLifecycle,
  updateBookingManual,
} from './bookings-admin.service.js';
import { getDashboardCounts } from './dashboard.service.js';
import { assignInquiry, createInquiry, listInquiries } from './inquiries.service.js';
import { createOfferPage, getOfferPage, getPublishedOfferPageBySlug, listOfferPages, listPublishedOfferPages, updateOfferPage } from './offers.service.js';
import {
  createMarkup,
  createRoute,
  deleteMarkup,
  deleteRoute,
  getMarkup,
  getRoute,
  listMarkups,
  listRoutes,
  updateMarkup,
  updateRoute,
} from './routes.service.js';
import { listSearchRecords } from './search-records.service.js';
import {
  createCustomer,
  createStaff,
  deleteStaff,
  getCustomer,
  getStaff,
  listCustomers,
  listStaff,
  updateCustomer,
  updateStaff,
} from './staff.service.js';
import {
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
  assignBookingSchema,
  bookingManualSchema,
  bookingStatusSchema,
} from './admin.validation.js';

const actor = (req: Request): { id: string; role: NonNullable<Request['user']>['role'] } => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return { id: req.user.id, role: req.user.role };
};

const meta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0,
});

export const dashboard = async (_req: Request, res: Response): Promise<void> => {
  const counts = await getDashboardCounts();
  sendSuccess(res, { counts });
};

export const staffList = async (req: Request, res: Response): Promise<void> => {
  const query = staffListQuerySchema.parse({ query: req.query }).query;
  const result = await listStaff(query);
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const staffGet = async (req: Request, res: Response): Promise<void> => {
  const staff = await getStaff(String(req.params.id));
  sendSuccess(res, { staff });
};

export const staffCreate = async (req: Request, res: Response): Promise<void> => {
  const body = createStaffSchema.parse({ body: req.body }).body;
  const staff = await createStaff(actor(req), body);
  sendSuccess(res, { staff }, 'Staff created', 201);
};

export const staffUpdate = async (req: Request, res: Response): Promise<void> => {
  const body = updateStaffSchema.parse({ body: req.body }).body;
  const staff = await updateStaff(actor(req), String(req.params.id), body);
  sendSuccess(res, { staff }, 'Staff updated');
};

export const staffDelete = async (req: Request, res: Response): Promise<void> => {
  await deleteStaff(actor(req), String(req.params.id));
  sendSuccess(res, {}, 'Staff deleted');
};

export const customerList = async (req: Request, res: Response): Promise<void> => {
  const query = listQuerySchema.parse({ query: req.query }).query;
  const result = await listCustomers(query);
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const customerGet = async (req: Request, res: Response): Promise<void> => {
  const customer = await getCustomer(String(req.params.id));
  sendSuccess(res, { customer });
};

export const customerCreate = async (req: Request, res: Response): Promise<void> => {
  const body = createCustomerSchema.parse({ body: req.body }).body;
  const customer = await createCustomer(actor(req), body);
  sendSuccess(res, { customer }, 'Customer created', 201);
};

export const customerUpdate = async (req: Request, res: Response): Promise<void> => {
  const body = updateCustomerSchema.parse({ body: req.body }).body;
  const customer = await updateCustomer(actor(req), String(req.params.id), body);
  sendSuccess(res, { customer }, 'Customer updated');
};

export const sessionsList = async (req: Request, res: Response): Promise<void> => {
  const query = sessionsQuerySchema.parse({ query: req.query }).query;
  const result = await listAccessRecords(query.page, query.limit, query.audience);
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const activityList = async (req: Request, res: Response): Promise<void> => {
  const query = listQuerySchema.parse({ query: req.query }).query;
  const result = await listActivityLogs(query.page, query.limit);
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const offersList = async (req: Request, res: Response): Promise<void> => {
  const query = listQuerySchema.parse({ query: req.query }).query;
  const result = await listOfferPages(query);
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const offersGet = async (req: Request, res: Response): Promise<void> => {
  const offer = await getOfferPage(String(req.params.id));
  sendSuccess(res, { offer });
};

export const offersCreate = async (req: Request, res: Response): Promise<void> => {
  const body = offerBodySchema.parse({ body: req.body }).body;
  const offer = await createOfferPage(actor(req).id, body);
  sendSuccess(res, { offer }, 'Offer page created', 201);
};

export const offersUpdate = async (req: Request, res: Response): Promise<void> => {
  const body = updateOfferBodySchema.parse({ body: req.body }).body;
  const offer = await updateOfferPage(actor(req).id, String(req.params.id), body);
  sendSuccess(res, { offer }, 'Offer page updated');
};

export const publicOffersList = async (req: Request, res: Response): Promise<void> => {
  const query = publicOffersQuerySchema.parse({ query: req.query }).query;
  const result = await listPublishedOfferPages({
    page: query.page,
    limit: query.limit,
    popupOnly: query.popupOnly,
  });
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const publicOffersGetBySlug = async (req: Request, res: Response): Promise<void> => {
  const offer = await getPublishedOfferPageBySlug(String(req.params.slug));
  sendSuccess(res, { offer });
};

export const searchesList = async (req: Request, res: Response): Promise<void> => {
  const query = searchRecordsQuerySchema.parse({ query: req.query }).query;
  const result = await listSearchRecords(query);
  sendSuccess(
    res,
    { items: result.items, ...meta(query.page, query.limit, result.total) },
    '',
    200,
    meta(query.page, query.limit, result.total),
  );
};

export const inquiriesList = async (req: Request, res: Response): Promise<void> => {
  const query = inquiriesQuerySchema.parse({ query: req.query }).query;
  const result = await listInquiries(query);
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const inquiriesCreate = async (req: Request, res: Response): Promise<void> => {
  const body = createInquirySchema.parse({ body: req.body }).body;
  const inquiry = await createInquiry(body);
  sendSuccess(res, { inquiry }, 'Inquiry received', 201);
};

export const inquiriesAssign = async (req: Request, res: Response): Promise<void> => {
  const inquiry = await assignInquiry(actor(req).id, String(req.params.id));
  sendSuccess(res, { inquiry }, 'Inquiry assigned');
};

export const bookingsList = async (req: Request, res: Response): Promise<void> => {
  const query = bookingsQuerySchema.parse({ query: req.query }).query;
  const result = await listAdminBookings({
    ...query,
    status: query.status as BookingStatus | undefined,
  });
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const bookingsGet = async (req: Request, res: Response): Promise<void> => {
  const booking = await getAdminBooking(String(req.params.id));
  sendSuccess(res, { booking });
};

export const bookingsAssign = async (req: Request, res: Response): Promise<void> => {
  const body = assignBookingSchema.parse({ body: req.body }).body;
  const booking = await assignBooking(actor(req).id, String(req.params.id), body.assignedTo);
  sendSuccess(res, { booking }, 'Booking assigned');
};

export const bookingsStatus = async (req: Request, res: Response): Promise<void> => {
  const body = bookingStatusSchema.parse({ body: req.body }).body;
  const booking = await changeBookingStatus(actor(req).id, String(req.params.id), body.status, body.comment);
  sendSuccess(res, { booking }, 'Booking status updated');
};

export const bookingsManual = async (req: Request, res: Response): Promise<void> => {
  const body = bookingManualSchema.parse({ body: req.body }).body;
  const booking = await updateBookingManual(actor(req).id, String(req.params.id), body);
  sendSuccess(res, { booking }, 'Booking details updated');
};

export const bookingsLifecycle = async (req: Request, res: Response): Promise<void> => {
  const items = await listBookingLifecycle(String(req.params.id));
  sendSuccess(res, { items });
};

export const bookingsConvert = async (req: Request, res: Response): Promise<void> => {
  const booking = await convertBookingToCustomer(actor(req), String(req.params.id));
  sendSuccess(res, { booking }, 'Converted to customer');
};

export const assignableStaff = async (_req: Request, res: Response): Promise<void> => {
  const items = await listAssignableStaff();
  sendSuccess(res, { items });
};

export const routesList = async (req: Request, res: Response): Promise<void> => {
  const query = routesQuerySchema.parse({ query: req.query }).query;
  const result = await listRoutes(query);
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const routesGet = async (req: Request, res: Response): Promise<void> => {
  const route = await getRoute(String(req.params.id));
  sendSuccess(res, { route });
};

export const routesCreate = async (req: Request, res: Response): Promise<void> => {
  const body = routeBodySchema.parse({ body: req.body }).body;
  const route = await createRoute(actor(req).id, body);
  sendSuccess(res, { route }, 'Route created', 201);
};

export const routesUpdate = async (req: Request, res: Response): Promise<void> => {
  const body = updateRouteBodySchema.parse({ body: req.body }).body;
  const route = await updateRoute(actor(req).id, String(req.params.id), body);
  sendSuccess(res, { route }, 'Route updated');
};

export const routesDelete = async (req: Request, res: Response): Promise<void> => {
  await deleteRoute(actor(req).id, String(req.params.id));
  sendSuccess(res, {}, 'Route deleted');
};

export const markupsList = async (req: Request, res: Response): Promise<void> => {
  const query = listQuerySchema.parse({ query: req.query }).query;
  const result = await listMarkups(String(req.params.id), query.page, query.limit);
  sendSuccess(res, { items: result.items, ...meta(query.page, query.limit, result.total) }, '', 200, meta(query.page, query.limit, result.total));
};

export const markupsCreate = async (req: Request, res: Response): Promise<void> => {
  const body = markupBodySchema.parse({ body: req.body }).body;
  const markup = await createMarkup(actor(req).id, String(req.params.id), body);
  sendSuccess(res, { markup }, 'Markup created', 201);
};

export const markupsGet = async (req: Request, res: Response): Promise<void> => {
  const markup = await getMarkup(String(req.params.markupId));
  sendSuccess(res, { markup });
};

export const markupsUpdate = async (req: Request, res: Response): Promise<void> => {
  const body = updateMarkupBodySchema.parse({ body: req.body }).body;
  const markup = await updateMarkup(actor(req).id, String(req.params.markupId), body);
  sendSuccess(res, { markup }, 'Markup updated');
};

export const markupsDelete = async (req: Request, res: Response): Promise<void> => {
  await deleteMarkup(actor(req).id, String(req.params.markupId));
  sendSuccess(res, {}, 'Markup deleted');
};
