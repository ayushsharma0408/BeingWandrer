import type { BookingRecord, BookingStatus, FlightMode, TravelClass } from './flights.js';
import type { UserRole } from './auth.js';

export const OFFER_PAGE_STATUSES = {
  PUBLISH: 'PUBLISH',
  DRAFT: 'DRAFT',
} as const;

export type OfferPageStatus = (typeof OFFER_PAGE_STATUSES)[keyof typeof OFFER_PAGE_STATUSES];

export const ROUTE_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type RouteStatus = (typeof ROUTE_STATUSES)[keyof typeof ROUTE_STATUSES];

export const META_SEARCH_CHANNELS = {
  D2C: 'D2C',
} as const;

export type MetaSearchChannel = (typeof META_SEARCH_CHANNELS)[keyof typeof META_SEARCH_CHANNELS];

export const MARKUP_TYPES = {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE',
  DISCOUNT: 'DISCOUNT',
} as const;

export type MarkupType = (typeof MARKUP_TYPES)[keyof typeof MARKUP_TYPES];

export const MARKUP_STATUSES = {
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
} as const;

export type MarkupStatus = (typeof MARKUP_STATUSES)[keyof typeof MARKUP_STATUSES];

export const ACCESS_TYPES = {
  CONSUMER: 'CONSUMER',
  ADMIN_PORTAL: 'ADMIN_PORTAL',
} as const;

export type AccessType = (typeof ACCESS_TYPES)[keyof typeof ACCESS_TYPES];

export const ACTIVITY_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  STATUS: 'STATUS',
  ASSIGN: 'ASSIGN',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
} as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES];

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

export interface AdminStaffRecord {
  id: string;
  email: string;
  fullName?: string;
  mobile?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
  createdAt: string;
}

export interface AdminCustomerRecord {
  id: string;
  email: string;
  fullName?: string;
  mobile?: string;
  isActive: boolean;
  bookingCount: number;
  searchCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminAccessRecord {
  id: string;
  user: AdminUserSummary | null;
  accessType: AccessType;
  ipAddress: string;
  visitorId?: string;
  createdAt: string;
}

export interface AdminActivityRecord {
  id: string;
  action: string;
  actionType: ActivityType;
  module: string;
  actionBy: AdminUserSummary | null;
  refId?: string;
  createdAt: string;
}

export interface AdminOfferPageRecord {
  id: string;
  name: string;
  slug: string;
  offerLink?: string;
  description?: string;
  imageUrl?: string;
  publishDate: string;
  status: OfferPageStatus;
  isShowPopup: boolean;
  createdAt: string;
}

export interface AdminSearchRecord {
  id: string;
  userId?: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  flightMode: FlightMode;
  travelClass: TravelClass;
  adults: number;
  children: number;
  infants: number;
  metaSearch: MetaSearchChannel;
  ipAddress: string;
  createdAt: string;
}

export interface AdminInquiryRecord {
  id: string;
  offerPageId?: string;
  offerPageName?: string;
  name: string;
  phone: string;
  email: string;
  passengerCount: number;
  travelDate?: string;
  assignedTo: AdminUserSummary | null;
  createdAt: string;
}

export interface AdminBookingCounts {
  all: number;
  unassigned: number;
  assigned: number;
  processing: number;
  followUp: number;
  confirmed: number;
  cancelled: number;
  failed: number;
  chargeback: number;
  pending: number;
}

export interface AdminDashboardCounts extends AdminBookingCounts {
  staff: number;
  customers: number;
  searches: number;
  inquiries: number;
}

export interface AdminBookingRecord extends BookingRecord {
  issuedPnr: string | null;
  assignedTo: AdminUserSummary | null;
  assignedBy: AdminUserSummary | null;
  assignedAt: string | null;
  mco: number | null;
  issuance: number | null;
  transaction: number | null;
  isOnline: boolean;
  userId: string | null;
  updatedAt: string;
}

export interface AdminLifecycleRecord {
  id: string;
  bookingId: string;
  status: BookingStatus;
  lifeCycle: string;
  comment?: string;
  actionBy: AdminUserSummary | null;
  actionOn: AdminUserSummary | null;
  createdAt: string;
}

export interface AdminRouteRecord {
  id: string;
  referenceName: string;
  origin: string;
  destination: string;
  airlines: string;
  metaSearch: MetaSearchChannel;
  status: RouteStatus;
  createdAt: string;
}

export interface AdminMarkupRecord {
  id: string;
  routeId: string;
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
  startActiveDate?: string;
  endActiveDate?: string;
  dta?: string;
  blackoutDates: string[];
  status: MarkupStatus;
  createdAt: string;
}
