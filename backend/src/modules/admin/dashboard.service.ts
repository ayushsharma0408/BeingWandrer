import { BOOKING_STATUSES, STAFF_ROLES, USER_ROLES, type AdminDashboardCounts } from '@best-in-flights-booking/shared-core';
import { requireDatabase } from '../../config/database.js';
import { UserModel } from '../auth/auth.model.js';
import { BookingModel } from '../bookings/bookings.model.js';
import { OfferInquiryModel, SearchRecordModel } from './admin.models.js';

const unassignedFilter = {
  isActive: true,
  $or: [
    { status: BOOKING_STATUSES.UNASSIGNED },
    { status: BOOKING_STATUSES.PENDING, assignedTo: { $exists: false } },
    { status: BOOKING_STATUSES.PENDING, assignedTo: null },
  ],
};

export const getDashboardCounts = async (): Promise<AdminDashboardCounts> => {
  requireDatabase();
  const [
    all,
    unassigned,
    assigned,
    processing,
    followUp,
    confirmed,
    cancelled,
    failed,
    chargeback,
    pending,
    staff,
    customers,
    searches,
    inquiries,
  ] = await Promise.all([
    BookingModel.countDocuments({ isActive: true }),
    BookingModel.countDocuments(unassignedFilter),
    BookingModel.countDocuments({ isActive: true, status: BOOKING_STATUSES.ASSIGNED }),
    BookingModel.countDocuments({ isActive: true, status: BOOKING_STATUSES.PROCESSING }),
    BookingModel.countDocuments({ isActive: true, status: BOOKING_STATUSES.FOLLOW_UP }),
    BookingModel.countDocuments({ isActive: true, status: BOOKING_STATUSES.CONFIRMED }),
    BookingModel.countDocuments({ isActive: true, status: BOOKING_STATUSES.CANCELLED }),
    BookingModel.countDocuments({ isActive: true, status: BOOKING_STATUSES.FAILED }),
    BookingModel.countDocuments({ isActive: true, status: BOOKING_STATUSES.CHARGEBACK }),
    BookingModel.countDocuments({ isActive: true, status: BOOKING_STATUSES.PENDING }),
    UserModel.countDocuments({ role: { $in: [...STAFF_ROLES] }, isDeleted: { $ne: true } }),
    UserModel.countDocuments({ role: USER_ROLES.USER, isDeleted: { $ne: true } }),
    SearchRecordModel.countDocuments(),
    OfferInquiryModel.countDocuments({ isDeleted: { $ne: true } }),
  ]);

  return {
    all,
    unassigned,
    assigned,
    processing,
    followUp,
    confirmed,
    cancelled,
    failed,
    chargeback,
    pending,
    staff,
    customers,
    searches,
    inquiries,
  };
};
