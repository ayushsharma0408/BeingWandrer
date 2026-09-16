import type { CardBrand } from './card.js';

export type FlightMode = 'OneWay' | 'Return';
export type TravelClass = 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
export type PassengerType = 'ADULT' | 'CHILD' | 'INFANT';
export const BOOKING_STATUSES = {
  PENDING: 'PENDING',
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  PROCESSING: 'PROCESSING',
  FOLLOW_UP: 'FOLLOW_UP',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  CHARGEBACK: 'CHARGEBACK',
} as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export interface FlightEndpoint {
  iataCode: string;
  airportName: string;
  terminal?: string;
  at: string;
  carrierCode: string;
  carrierName: string;
  flightNumber: string;
  aircraftName?: string;
  cabin?: string;
}

export interface FlightSegment {
  duration: string;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  flightNumber: string;
}

export interface FlightLeg {
  duration: string;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  numberOfStops: number;
  flightNumber: string;
  segments: FlightSegment[];
}

export interface BaggageAllowance {
  quantity: number;
  weightAllowance: number;
  unit?: string;
}

export interface FlightOffer {
  offerId: string;
  flightMode: FlightMode;
  currency: string;
  grandTotal: number;
  adultTotal: number;
  adultBase: number;
  adultTaxes: number;
  departing: FlightLeg;
  returning: FlightLeg | null;
  baggage: {
    checkedInBags: BaggageAllowance;
    carryOnBags: BaggageAllowance;
  };
  adults: number;
  children: number;
  infants: number;
  source: string;
  refundable: boolean;
}

export interface FlightSearchResult {
  count: number;
  offers: FlightOffer[];
}

export interface BookingPassengerInput {
  fullName: string;
  dateOfBirth: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  passengerType: PassengerType;
}

export interface BookingPassenger extends BookingPassengerInput {
  id: string;
}

export interface BookingContact {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  countryCode: string;
  city: string;
  state: string;
  address: string;
  zip: string;
}

export interface BookingExtras {
  refundable: boolean;
  addPack: boolean;
}

export interface BookingPaymentSummary {
  method: 'CARD';
  brand: CardBrand;
  last4: string;
  holderName: string;
  expMonth: string;
  expYear: string;
}

export interface BookingCardInput {
  brand: CardBrand;
  holderName: string;
  number: string;
  expDate: string;
  cvv: string;
}

export interface BookingRecord {
  id: string;
  offerId: string;
  status: BookingStatus;
  pnr: string | null;
  totalAmount: number;
  currency: string;
  offer: FlightOffer;
  passengers: BookingPassenger[];
  contact: BookingContact;
  extras: BookingExtras;
  payment?: BookingPaymentSummary;
  isGuest: boolean;
  createdAt: string;
}

export interface PriceAlertRecord {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  flightMode: FlightMode;
  currency: string;
  currentPrice: number;
  createdAt: string;
}
