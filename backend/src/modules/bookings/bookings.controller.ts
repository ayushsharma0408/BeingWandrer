import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/middleware/error-handler.js';
import { cancelBooking, createBooking, getBooking, listBookings } from './bookings.service.js';
import { createBookingSchema, listBookingsQuerySchema } from './bookings.validation.js';

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = createBookingSchema.parse({ body: req.body }).body;
  const booking = await createBooking(req.user?.id ?? null, body);
  sendSuccess(res, { booking }, 'Booking created', 201);
};

export const list = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const query = listBookingsQuerySchema.parse({ query: req.query }).query;
  const result = await listBookings(req.user.id, req.user.role, query.page, query.limit);
  sendSuccess(res, result.items, '', 200, {
    page: query.page,
    limit: query.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / query.limit) || 0,
  });
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const booking = await getBooking(req.user.id, req.user.role, String(req.params.id));
  sendSuccess(res, { booking });
};

export const cancel = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const booking = await cancelBooking(req.user.id, req.user.role, String(req.params.id));
  sendSuccess(res, { booking }, 'Booking cancelled');
};
