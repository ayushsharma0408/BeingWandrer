import mongoose, { Schema } from 'mongoose';
import type { FlightMode } from '@best-in-flights-booking/shared-core';

export interface PriceAlertDocument {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  email: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  flightMode: FlightMode;
  currency: string;
  currentPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const priceAlertSchema = new Schema<PriceAlertDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    origin: { type: String, required: true, uppercase: true },
    destination: { type: String, required: true, uppercase: true },
    departureDate: { type: String, required: true },
    returnDate: { type: String, default: '' },
    flightMode: { type: String, required: true, enum: ['OneWay', 'Return'] },
    currency: { type: String, required: true, uppercase: true },
    currentPrice: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

priceAlertSchema.index(
  { email: 1, origin: 1, destination: 1, departureDate: 1, returnDate: 1, flightMode: 1 },
  { unique: true },
);

export const PriceAlertModel = mongoose.model<PriceAlertDocument>('PriceAlert', priceAlertSchema);
