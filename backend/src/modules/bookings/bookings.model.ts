import mongoose, { Schema } from 'mongoose';
import type {
  BookingContact,
  BookingExtras,
  BookingPaymentSummary,
  BookingStatus,
  FlightOffer,
} from '@best-in-flights-booking/shared-core';

export interface BookingDocument {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  offerId: string;
  pnr: string | null;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  offer: FlightOffer;
  contact: BookingContact;
  extras: BookingExtras;
  payment?: BookingPaymentSummary;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    offerId: { type: String, required: true },
    pnr: { type: String, default: null, sparse: true },
    status: { type: String, required: true, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    offer: { type: Schema.Types.Mixed, required: true },
    contact: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: String, required: true },
      countryCode: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      address: { type: String, required: true },
      zip: { type: String, required: true },
    },
    extras: {
      refundable: { type: Boolean, default: false },
      addPack: { type: Boolean, default: false },
    },
    payment: {
      method: { type: String, enum: ['CARD'] },
      brand: { type: String, enum: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'] },
      last4: { type: String },
      holderName: { type: String },
      expMonth: { type: String },
      expYear: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'contact.email': 1, createdAt: -1 });

export const BookingModel = mongoose.model<BookingDocument>('Booking', bookingSchema);

export interface PassengerDocument {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  fullName: string;
  dateOfBirth: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  passengerType: 'ADULT' | 'CHILD' | 'INFANT';
  createdAt: Date;
  updatedAt: Date;
}

const passengerSchema = new Schema<PassengerDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    passengerType: { type: String, required: true, enum: ['ADULT', 'CHILD', 'INFANT'] },
  },
  { timestamps: true },
);

export const PassengerModel = mongoose.model<PassengerDocument>('Passenger', passengerSchema);
