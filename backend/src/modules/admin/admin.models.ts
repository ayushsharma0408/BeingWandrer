import mongoose, { Schema } from 'mongoose';
import {
  ACCESS_TYPES,
  ACTIVITY_TYPES,
  BOOKING_STATUSES,
  MARKUP_STATUSES,
  MARKUP_TYPES,
  META_SEARCH_CHANNELS,
  OFFER_PAGE_STATUSES,
  ROUTE_STATUSES,
  type AccessType,
  type ActivityType,
  type BookingStatus,
  type MarkupStatus,
  type MarkupType,
  type MetaSearchChannel,
  type OfferPageStatus,
  type RouteStatus,
} from '@best-in-flights-booking/shared-core';

export interface AccessRecordDocument {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  visitorId?: string;
  accessType: AccessType;
  ipAddress: string;
  createdAt: Date;
}

const accessRecordSchema = new Schema<AccessRecordDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    visitorId: { type: String, index: true },
    accessType: { type: String, required: true, enum: Object.values(ACCESS_TYPES) },
    ipAddress: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

accessRecordSchema.index({ createdAt: -1 });
accessRecordSchema.index({ visitorId: 1, accessType: 1, createdAt: -1 });

export const AccessRecordModel = mongoose.model<AccessRecordDocument>('AccessRecord', accessRecordSchema);

export interface ActivityLogDocument {
  _id: mongoose.Types.ObjectId;
  action: string;
  actionType: ActivityType;
  module: string;
  actionBy?: mongoose.Types.ObjectId;
  refId?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<ActivityLogDocument>(
  {
    action: { type: String, required: true },
    actionType: { type: String, required: true, enum: Object.values(ACTIVITY_TYPES) },
    module: { type: String, required: true },
    actionBy: { type: Schema.Types.ObjectId, ref: 'User' },
    refId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });

export const ActivityLogModel = mongoose.model<ActivityLogDocument>('ActivityLog', activityLogSchema);

export interface OfferPageDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  offerLink?: string;
  description?: string;
  imageUrl?: string;
  publishDate: Date;
  status: OfferPageStatus;
  isShowPopup: boolean;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const offerPageSchema = new Schema<OfferPageDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    offerLink: { type: String, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    publishDate: { type: Date, required: true },
    status: { type: String, required: true, enum: Object.values(OFFER_PAGE_STATUSES), default: OFFER_PAGE_STATUSES.PUBLISH },
    isShowPopup: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const OfferPageModel = mongoose.model<OfferPageDocument>('OfferPage', offerPageSchema);

export interface SearchRecordDocument {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  flightMode: 'OneWay' | 'Return';
  travelClass: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  adults: number;
  children: number;
  infants: number;
  metaSearch: MetaSearchChannel;
  ipAddress: string;
  createdAt: Date;
}

const searchRecordSchema = new Schema<SearchRecordDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    origin: { type: String, required: true, uppercase: true },
    destination: { type: String, required: true, uppercase: true },
    departureDate: { type: String, required: true },
    returnDate: { type: String },
    flightMode: { type: String, required: true, enum: ['OneWay', 'Return'] },
    travelClass: { type: String, required: true, enum: ['Economy', 'PremiumEconomy', 'Business', 'First'] },
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
    metaSearch: { type: String, required: true, enum: Object.values(META_SEARCH_CHANNELS), default: META_SEARCH_CHANNELS.D2C },
    ipAddress: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

searchRecordSchema.index({ createdAt: -1 });
searchRecordSchema.index({ userId: 1, createdAt: -1 });
searchRecordSchema.index({ origin: 1, destination: 1, createdAt: -1 });

export const SearchRecordModel = mongoose.model<SearchRecordDocument>('SearchRecord', searchRecordSchema);

export interface OfferInquiryDocument {
  _id: mongoose.Types.ObjectId;
  offerPageId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  passengerCount: number;
  travelDate?: Date;
  assignedTo?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerInquirySchema = new Schema<OfferInquiryDocument>(
  {
    offerPageId: { type: Schema.Types.ObjectId, ref: 'OfferPage' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passengerCount: { type: Number, required: true, min: 1 },
    travelDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

offerInquirySchema.index({ assignedTo: 1, createdAt: -1 });

export const OfferInquiryModel = mongoose.model<OfferInquiryDocument>('OfferInquiry', offerInquirySchema);

export interface FlightRouteDocument {
  _id: mongoose.Types.ObjectId;
  referenceName: string;
  origin: string;
  destination: string;
  airlines: string;
  metaSearch: MetaSearchChannel;
  status: RouteStatus;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const flightRouteSchema = new Schema<FlightRouteDocument>(
  {
    referenceName: { type: String, required: true, trim: true },
    origin: { type: String, required: true, uppercase: true, trim: true },
    destination: { type: String, required: true, uppercase: true, trim: true },
    airlines: { type: String, required: true, default: 'ALL' },
    metaSearch: { type: String, required: true, enum: Object.values(META_SEARCH_CHANNELS), default: META_SEARCH_CHANNELS.D2C },
    status: { type: String, required: true, enum: Object.values(ROUTE_STATUSES), default: ROUTE_STATUSES.ACTIVE },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

flightRouteSchema.index({ origin: 1, destination: 1, isDeleted: 1 });
flightRouteSchema.index({ isDeleted: 1, createdAt: -1 });

export const FlightRouteModel = mongoose.model<FlightRouteDocument>('FlightRoute', flightRouteSchema);

export interface MarkupDocument {
  _id: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  inboundClasses: string;
  outboundClasses: string;
  onePx?: string;
  twoPx?: string;
  threePx?: string;
  fourPx?: string;
  fivePx?: string;
  sixPx?: string;
  sevenPx?: string;
  eightPx?: string;
  ninePx?: string;
  markupAmount: number;
  markupType: MarkupType;
  startActiveDate?: Date;
  endActiveDate?: Date;
  dta?: string;
  blackoutDates: string[];
  status: MarkupStatus;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const markupSchema = new Schema<MarkupDocument>(
  {
    routeId: { type: Schema.Types.ObjectId, ref: 'FlightRoute', required: true, index: true },
    inboundClasses: { type: String, default: '' },
    outboundClasses: { type: String, default: '' },
    onePx: { type: String },
    twoPx: { type: String },
    threePx: { type: String },
    fourPx: { type: String },
    fivePx: { type: String },
    sixPx: { type: String },
    sevenPx: { type: String },
    eightPx: { type: String },
    ninePx: { type: String },
    markupAmount: { type: Number, required: true, default: 0 },
    markupType: { type: String, required: true, enum: Object.values(MARKUP_TYPES), default: MARKUP_TYPES.FIXED },
    startActiveDate: { type: Date },
    endActiveDate: { type: Date },
    dta: { type: String },
    blackoutDates: { type: [String], default: [] },
    status: { type: String, required: true, enum: Object.values(MARKUP_STATUSES), default: MARKUP_STATUSES.ENABLE },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const MarkupModel = mongoose.model<MarkupDocument>('Markup', markupSchema);

export interface BookingLifecycleDocument {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  status: BookingStatus;
  lifeCycle: string;
  comment?: string;
  actionBy?: mongoose.Types.ObjectId;
  actionOn?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookingLifecycleSchema = new Schema<BookingLifecycleDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    status: { type: String, required: true, enum: Object.values(BOOKING_STATUSES) },
    lifeCycle: { type: String, required: true },
    comment: { type: String },
    actionBy: { type: Schema.Types.ObjectId, ref: 'User' },
    actionOn: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

bookingLifecycleSchema.index({ bookingId: 1, createdAt: -1 });

export const BookingLifecycleModel = mongoose.model<BookingLifecycleDocument>(
  'BookingLifecycle',
  bookingLifecycleSchema,
);
