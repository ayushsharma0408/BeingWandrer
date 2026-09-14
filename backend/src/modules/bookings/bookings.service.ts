import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { ERROR_CODES, USER_ROLES, type BookingRecord } from '@best-in-flights-booking/shared-core';
import { requireDatabase } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import { getCachedOffer } from '../flights/flights.service.js';
import { BookingModel, PassengerModel, type BookingDocument } from './bookings.model.js';
import { toPaymentSummary, type CreateBookingBody } from './bookings.validation.js';

const ADD_PACK_PER_TRAVELLER = 499;

const generatePnr = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};

const extrasTotal = (input: CreateBookingBody, grandTotal: number, adults: number, children: number, infants: number): number => {
  const travellers = Math.max(adults + children + infants, 1);
  const refundableFee = input.extras.refundable ? Number((grandTotal / travellers / 6).toFixed(2)) : 0;
  const addPackFee = input.extras.addPack ? ADD_PACK_PER_TRAVELLER * (adults + children) : 0;
  return refundableFee + addPackFee;
};

const toBookingRecord = async (booking: BookingDocument): Promise<BookingRecord> => {
  const passengers = await PassengerModel.find({ bookingId: booking._id }).sort({ createdAt: 1 });
  const record: BookingRecord = {
    id: String(booking._id),
    offerId: booking.offerId,
    status: booking.status,
    pnr: booking.pnr,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    offer: booking.offer,
    contact: booking.contact,
    extras: booking.extras,
    isGuest: !booking.userId,
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
    createdAt: booking.createdAt.toISOString(),
  };
  if (booking.payment?.last4) {
    record.payment = booking.payment;
  }
  return record;
};

const countByType = (
  passengers: CreateBookingBody['passengers'],
  type: CreateBookingBody['passengers'][number]['passengerType'],
): number => {
  return passengers.filter((passenger) => passenger.passengerType === type).length;
};

export const createBooking = async (userId: string | null, input: CreateBookingBody): Promise<BookingRecord> => {
  requireDatabase();
  const offer = await getCachedOffer(input.offerId);
  if (countByType(input.passengers, 'ADULT') !== offer.adults) {
    throw AppError.validation('Adult passenger count must match the selected offer', 'passengers');
  }
  if (countByType(input.passengers, 'CHILD') !== offer.children) {
    throw AppError.validation('Child passenger count must match the selected offer', 'passengers');
  }
  if (countByType(input.passengers, 'INFANT') !== offer.infants) {
    throw AppError.validation('Infant passenger count must match the selected offer', 'passengers');
  }

  const totalAmount = offer.grandTotal + extrasTotal(input, offer.grandTotal, offer.adults, offer.children, offer.infants);
  const payment = toPaymentSummary(input.card);
  const booking = await BookingModel.create({
    ...(userId ? { userId } : {}),
    offerId: offer.offerId,
    status: 'PENDING',
    pnr: generatePnr(),
    totalAmount,
    currency: offer.currency,
    offer,
    contact: input.contact,
    extras: input.extras,
    payment,
  });

  await PassengerModel.insertMany(
    input.passengers.map((passenger) => ({
      bookingId: booking._id,
      fullName: passenger.fullName,
      dateOfBirth: new Date(`${passenger.dateOfBirth}T00:00:00.000Z`),
      gender: passenger.gender,
      passengerType: passenger.passengerType,
    })),
  );

  return toBookingRecord(booking);
};

export const listBookings = async (
  userId: string,
  role: string,
  page: number,
  limit: number,
): Promise<{ items: BookingRecord[]; total: number }> => {
  requireDatabase();
  const filter = role === USER_ROLES.ADMIN ? { isActive: true } : { userId, isActive: true };
  const [docs, total] = await Promise.all([
    BookingModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BookingModel.countDocuments(filter),
  ]);
  const items = await Promise.all(docs.map((doc) => toBookingRecord(doc)));
  return { items, total };
};

export const getBooking = async (userId: string, role: string, bookingId: string): Promise<BookingRecord> => {
  requireDatabase();
  if (!mongoose.isValidObjectId(bookingId)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  const booking = await BookingModel.findById(bookingId);
  if (!booking || !booking.isActive) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  if (role !== USER_ROLES.ADMIN && String(booking.userId ?? '') !== userId) {
    throw AppError.forbidden();
  }
  return toBookingRecord(booking);
};

export const cancelBooking = async (userId: string, role: string, bookingId: string): Promise<BookingRecord> => {
  requireDatabase();
  if (!mongoose.isValidObjectId(bookingId)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  const booking = await BookingModel.findById(bookingId);
  if (!booking || !booking.isActive) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Booking not found');
  }
  if (role !== USER_ROLES.ADMIN && String(booking.userId ?? '') !== userId) {
    throw AppError.forbidden();
  }
  booking.status = 'CANCELLED';
  await booking.save();
  return toBookingRecord(booking);
};
