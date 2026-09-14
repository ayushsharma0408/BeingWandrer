import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  BOOKING_STATUSES,
  ERROR_CODES,
  STAFF_ROLES,
  USER_ROLES,
  type AdminBookingRecord,
  type AdminLifecycleRecord,
  type AdminUserSummary,
  type BookingRecord,
  type BookingStatus,
  type UserRole,
} from '@best-in-flights-booking/shared-core';
import { getEnv } from '../../config/env.js';
import { requireDatabase } from '../../config/database.js';
import { BCRYPT_ROUNDS, BCRYPT_ROUNDS_TEST } from '../../shared/constants/index.js';
import { AppError } from '../../shared/errors/app-error.js';
import { UserModel, type UserDocument } from '../auth/auth.model.js';
import { BookingModel, PassengerModel } from '../bookings/bookings.model.js';
import { BookingLifecycleModel } from './admin.models.js';
import { ACTIVITY, recordActivity } from './activity.service.js';

const bcryptRounds = (): number => {
  return getEnv().NODE_ENV === 'test' ? BCRYPT_ROUNDS_TEST : BCRYPT_ROUNDS;
};

const toUser = (user: UserDocument | null | undefined): AdminUserSummary | null => {
  if (!user) {
    return null;
  }
  const summary: AdminUserSummary = { id: String(user._id), email: user.email, role: user.role };
  if (user.fullName) {
    summary.fullName = user.fullName;
  }
  return summary;
};

const lifecycleLabel = (status: BookingStatus): string => {
  const labels: Record<BookingStatus, string> = {
    PENDING: 'Booking Pending',
    UNASSIGNED: 'Booking Unassigned',
    ASSIGNED: 'Booking Assigned',
    PROCESSING: 'Booking Processing',
    FOLLOW_UP: 'Booking Follow up',
    CONFIRMED: 'Booking Confirmed',
    CANCELLED: 'Booking Cancelled',
    FAILED: 'Booking Failed',
    CHARGEBACK: 'Booking Chargeback',
  };
  return labels[status];
};

const toAdminBooking = async (booking: {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  offerId: string;
  pnr: string | null;
  issuedPnr?: string | null;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  offer: BookingRecord['offer'];
  contact: BookingRecord['contact'];
  extras: BookingRecord['extras'];
  payment?: BookingRecord['payment'];
  assignedTo?: UserDocument | mongoose.Types.ObjectId | null;
  assignedBy?: UserDocument | mongoose.Types.ObjectId | null;
  assignedAt?: Date;
  mco?: number | null;
  issuance?: number | null;
  transaction?: number | null;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Promise<AdminBookingRecord> => {
  const passengers = await PassengerModel.find({ bookingId: booking._id }).sort({ createdAt: 1 });
  const assignedTo =
    booking.assignedTo && typeof booking.assignedTo === 'object' && 'email' in booking.assignedTo
      ? toUser(booking.assignedTo as UserDocument)
      : null;
  const assignedBy =
    booking.assignedBy && typeof booking.assignedBy === 'object' && 'email' in booking.assignedBy
      ? toUser(booking.assignedBy as UserDocument)
      : null;

  const record: AdminBookingRecord = {
    id: String(booking._id),
    offerId: booking.offerId,
    status: booking.status,
    pnr: booking.pnr,
    issuedPnr: booking.issuedPnr ?? null,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    offer: booking.offer,
    contact: booking.contact,
    extras: booking.extras,
    isGuest: !booking.userId,
    userId: booking.userId ? String(booking.userId) : null,
    assignedTo,
    assignedBy,
    assignedAt: booking.assignedAt ? booking.assignedAt.toISOString() : null,
    mco: booking.mco ?? null,
    issuance: booking.issuance ?? null,
    transaction: booking.transaction ?? null,
    isOnline: booking.isOnline,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    passengers: passengers.map((passenger) => {
      const item: BookingRecord['passengers'][number] = {
        id: String(passenger._id),
        fullName: passenger.fullName,
        dateOfBirth: passenger.dateOfBirth.toISOString().slice(0, 10),
        passengerType: passenger.passengerType,
      };
      if (passenger.gender) {
        item.gender = passenger.gender;
      }
      return item;
    }),
  };
  if (booking.payment?.last4) {
    record.payment = booking.payment;
  }
  return record;
};

const requireBookingId = (id: string): mongoose.Types.ObjectId => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  return new mongoose.Types.ObjectId(id);
};

const unassignedMatch = {
  $or: [
    { status: BOOKING_STATUSES.UNASSIGNED },
    { status: BOOKING_STATUSES.PENDING, assignedTo: { $exists: false } },
    { status: BOOKING_STATUSES.PENDING, assignedTo: null },
  ],
};

export const listAdminBookings = async (input: {
  page: number;
  limit: number;
  status?: BookingStatus | 'UNASSIGNED';
  q?: string;
  assignedTo?: string;
  customerId?: string;
  from?: string;
  to?: string;
  isOnline?: boolean;
}): Promise<{ items: AdminBookingRecord[]; total: number }> => {
  requireDatabase();
  const filter: Record<string, unknown> = { isActive: true };

  if (input.status === BOOKING_STATUSES.UNASSIGNED) {
    Object.assign(filter, unassignedMatch);
  } else if (input.status) {
    filter.status = input.status;
  }
  if (input.assignedTo) {
    filter.assignedTo = input.assignedTo;
  }
  if (input.customerId) {
    filter.userId = input.customerId;
  }
  if (input.isOnline !== undefined) {
    filter.isOnline = input.isOnline;
  }
  if (input.from || input.to) {
    const createdAt: Record<string, Date> = {};
    if (input.from) createdAt.$gte = new Date(`${input.from}T00:00:00.000Z`);
    if (input.to) createdAt.$lte = new Date(`${input.to}T23:59:59.999Z`);
    filter.createdAt = createdAt;
  }
  if (input.q) {
    const rx = new RegExp(input.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { pnr: rx },
      { issuedPnr: rx },
      { 'contact.fullName': rx },
      { 'contact.email': rx },
      { 'contact.phone': rx },
    ];
  }

  const [docs, total] = await Promise.all([
    BookingModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .populate<{ assignedTo: UserDocument | null }>('assignedTo', 'email fullName role')
      .populate<{ assignedBy: UserDocument | null }>('assignedBy', 'email fullName role'),
    BookingModel.countDocuments(filter),
  ]);

  const items = await Promise.all(docs.map((doc) => toAdminBooking(doc)));
  return { items, total };
};

export const getAdminBooking = async (bookingId: string): Promise<AdminBookingRecord> => {
  requireDatabase();
  const booking = await BookingModel.findOne({ _id: requireBookingId(bookingId), isActive: true })
    .populate<{ assignedTo: UserDocument | null }>('assignedTo', 'email fullName role')
    .populate<{ assignedBy: UserDocument | null }>('assignedBy', 'email fullName role');
  if (!booking) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  return toAdminBooking(booking);
};

export const assignBooking = async (
  actorId: string,
  bookingId: string,
  assigneeId: string,
): Promise<AdminBookingRecord> => {
  requireDatabase();
  const booking = await BookingModel.findOne({ _id: requireBookingId(bookingId), isActive: true });
  if (!booking) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  if (!mongoose.isValidObjectId(assigneeId)) {
    throw AppError.validation('Invalid staff member', 'assignedTo');
  }
  const assignee = await UserModel.findOne({ _id: assigneeId, isDeleted: { $ne: true }, isActive: true });
  if (!assignee || !STAFF_ROLES.includes(assignee.role)) {
    throw AppError.validation('Assignee must be an active staff member', 'assignedTo');
  }

  booking.assignedTo = assignee._id;
  booking.assignedBy = new mongoose.Types.ObjectId(actorId);
  booking.assignedAt = new Date();
  booking.status = BOOKING_STATUSES.ASSIGNED;
  await booking.save();

  await BookingLifecycleModel.create({
    bookingId: booking._id,
    status: BOOKING_STATUSES.ASSIGNED,
    lifeCycle: lifecycleLabel(BOOKING_STATUSES.ASSIGNED),
    actionBy: actorId,
    actionOn: assignee._id,
  });
  await recordActivity({
    action: `Assigned booking ${booking.pnr ?? bookingId}`,
    actionType: ACTIVITY.ASSIGN,
    module: 'Booking',
    actionBy: actorId,
    refId: String(booking._id),
  });
  return getAdminBooking(String(booking._id));
};

export const changeBookingStatus = async (
  actorId: string,
  bookingId: string,
  status: BookingStatus,
  comment?: string,
): Promise<AdminBookingRecord> => {
  requireDatabase();
  const booking = await BookingModel.findOne({ _id: requireBookingId(bookingId), isActive: true });
  if (!booking) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  booking.status = status;
  await booking.save();
  await BookingLifecycleModel.create({
    bookingId: booking._id,
    status,
    lifeCycle: lifecycleLabel(status),
    ...(comment ? { comment } : {}),
    actionBy: actorId,
    ...(booking.assignedTo ? { actionOn: booking.assignedTo } : {}),
  });
  await recordActivity({
    action: `Set booking ${booking.pnr ?? bookingId} to ${status}`,
    actionType: ACTIVITY.STATUS,
    module: 'Booking',
    actionBy: actorId,
    refId: String(booking._id),
  });
  return getAdminBooking(String(booking._id));
};

export const updateBookingManual = async (
  actorId: string,
  bookingId: string,
  input: { issuedPnr?: string; mco?: number | null; issuance?: number | null; transaction?: number | null },
): Promise<AdminBookingRecord> => {
  requireDatabase();
  const booking = await BookingModel.findOne({ _id: requireBookingId(bookingId), isActive: true });
  if (!booking) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  if (input.issuedPnr !== undefined) booking.issuedPnr = input.issuedPnr;
  if (input.mco !== undefined) booking.mco = input.mco;
  if (input.issuance !== undefined) booking.issuance = input.issuance;
  if (input.transaction !== undefined) booking.transaction = input.transaction;
  await booking.save();
  await recordActivity({
    action: `Updated ticket details for ${booking.pnr ?? bookingId}`,
    actionType: ACTIVITY.UPDATE,
    module: 'Booking',
    actionBy: actorId,
    refId: String(booking._id),
  });
  return getAdminBooking(String(booking._id));
};

export const listBookingLifecycle = async (bookingId: string): Promise<AdminLifecycleRecord[]> => {
  requireDatabase();
  await getAdminBooking(bookingId);
  const docs = await BookingLifecycleModel.find({ bookingId })
    .sort({ createdAt: -1 })
    .populate<{ actionBy: UserDocument | null }>('actionBy', 'email fullName role')
    .populate<{ actionOn: UserDocument | null }>('actionOn', 'email fullName role');

  return docs.map((doc) => {
    const item: AdminLifecycleRecord = {
      id: String(doc._id),
      bookingId: String(doc.bookingId),
      status: doc.status,
      lifeCycle: doc.lifeCycle,
      actionBy: toUser(doc.actionBy),
      actionOn: toUser(doc.actionOn),
      createdAt: doc.createdAt.toISOString(),
    };
    if (doc.comment) {
      item.comment = doc.comment;
    }
    return item;
  });
};

export const convertBookingToCustomer = async (
  actor: { id: string; role: UserRole },
  bookingId: string,
): Promise<AdminBookingRecord> => {
  requireDatabase();
  const booking = await BookingModel.findOne({ _id: requireBookingId(bookingId), isActive: true });
  if (!booking) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  if (booking.userId) {
    throw AppError.validation('This booking already belongs to a customer');
  }

  const email = booking.contact.email.toLowerCase();
  let user = await UserModel.findOne({ email, isDeleted: { $ne: true } });
  if (!user) {
    const passwordHash = await bcrypt.hash(`Tmp#${Math.random().toString(36).slice(2, 10)}9`, bcryptRounds());
    user = await UserModel.create({
      email,
      passwordHash,
      fullName: booking.contact.fullName,
      mobile: booking.contact.phone,
      role: USER_ROLES.USER,
      createdBy: actor.id,
    });
  }

  booking.userId = user._id;
  await booking.save();
  await recordActivity({
    action: `Linked booking ${booking.pnr ?? bookingId} to customer ${email}`,
    actionType: ACTIVITY.UPDATE,
    module: 'Booking',
    actionBy: actor.id,
    refId: String(booking._id),
  });
  return getAdminBooking(String(booking._id));
};

export const listAssignableStaff = async (): Promise<AdminUserSummary[]> => {
  requireDatabase();
  const docs = await UserModel.find({
    role: { $in: [...STAFF_ROLES] },
    isDeleted: { $ne: true },
    isActive: true,
  }).sort({ fullName: 1, email: 1 });
  return docs.map((doc) => {
    const item: AdminUserSummary = { id: String(doc._id), email: doc.email, role: doc.role };
    if (doc.fullName) {
      item.fullName = doc.fullName;
    }
    return item;
  });
};
