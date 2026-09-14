import mongoose, { Schema } from 'mongoose';
import type { FlightOffer } from '@best-in-flights-booking/shared-core';

export interface CachedOfferDocument {
  _id: mongoose.Types.ObjectId;
  offerId: string;
  snapshot: FlightOffer;
  expiresAt: Date;
  createdAt: Date;
}

const cachedOfferSchema = new Schema<CachedOfferDocument>(
  {
    offerId: { type: String, required: true, unique: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

cachedOfferSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CachedOfferModel = mongoose.model<CachedOfferDocument>('FlightOffer', cachedOfferSchema);
