import {
  MARKUP_STATUSES,
  MARKUP_TYPES,
  ROUTE_STATUSES,
  type FlightOffer,
  type MarkupType,
} from '@best-in-flights-booking/shared-core';
import { isDatabaseConnected } from '../../config/database.js';
import { logger } from '../../shared/logger/logger.js';
import { FlightRouteModel, MarkupModel, type FlightRouteDocument, type MarkupDocument } from './admin.models.js';

const PAX_KEYS = ['onePx', 'twoPx', 'threePx', 'fourPx', 'fivePx', 'sixPx', 'sevenPx', 'eightPx', 'ninePx'] as const;

const isoDay = (value?: Date): string => {
  return value ? value.toISOString().slice(0, 10) : '';
};

const tokens = (raw?: string): string[] => {
  return (raw ?? '')
    .split(/[,\s]+/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
};

const cabinLetter = (cabin?: string): string => {
  const value = (cabin ?? '').trim().toUpperCase();
  if (!value) {
    return '';
  }
  if (value.length === 1) {
    return value;
  }
  if (value.includes('PREMIUM')) {
    return 'W';
  }
  if (value.includes('BUSINESS')) {
    return 'C';
  }
  if (value.includes('FIRST')) {
    return 'F';
  }
  if (value.includes('ECONOMY')) {
    return 'Y';
  }
  return value.charAt(0);
};

const matchesClasses = (raw: string | undefined, cabin?: string): boolean => {
  const list = tokens(raw);
  if (list.length === 0) {
    return true;
  }
  const letter = cabinLetter(cabin);
  if (!letter) {
    return true;
  }
  return list.includes(letter);
};

const matchesAirline = (airlines: string, carrierCode: string): boolean => {
  const list = tokens(airlines);
  if (list.length === 0 || list.includes('ALL')) {
    return true;
  }
  return list.includes(carrierCode.trim().toUpperCase());
};

const daysUntil = (isoDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const travel = new Date(`${isoDate}T00:00:00`);
  return Math.round((travel.getTime() - today.getTime()) / 86_400_000);
};

const matchesDta = (dta: string | undefined, departureDate: string): boolean => {
  const raw = dta?.trim() ?? '';
  if (!raw) {
    return true;
  }
  const days = daysUntil(departureDate);
  const range = /^(\d+)\s*-\s*(\d+)$/.exec(raw);
  if (range) {
    return days >= Number(range[1]) && days <= Number(range[2]);
  }
  const min = Number(raw);
  if (!Number.isFinite(min)) {
    return true;
  }
  return days >= min;
};

const occupancyUnit = (markup: MarkupDocument, paxCount: number): number | undefined => {
  const amount = Number(markup.markupAmount) || 0;
  const index = Math.min(Math.max(paxCount, 1), 9) - 1;
  const raw = String(markup[PAX_KEYS[index]] ?? '').trim();
  const anyOccupancy = PAX_KEYS.some((key) => String(markup[key] ?? '').trim() !== '');
  if (anyOccupancy && !raw) {
    return undefined;
  }
  if (!raw) {
    return amount;
  }
  const override = Number(raw);
  if (!Number.isFinite(override) || override === 0) {
    return undefined;
  }
  if (override === 1 && amount !== 1) {
    return amount;
  }
  return override;
};

const moneyDelta = (type: MarkupType, unit: number, grandTotal: number, paxCount: number): number => {
  if (type === MARKUP_TYPES.PERCENTAGE) {
    return (grandTotal * unit) / 100;
  }
  const total = unit * paxCount;
  if (type === MARKUP_TYPES.DISCOUNT) {
    return -total;
  }
  return total;
};

const applyOne = (offer: FlightOffer, markup: MarkupDocument, paxCount: number): FlightOffer => {
  const unit = occupancyUnit(markup, paxCount);
  if (!unit) {
    return offer;
  }
  const delta = moneyDelta(markup.markupType, unit, offer.grandTotal, paxCount);
  const grandTotal = Math.max(0, Math.round(offer.grandTotal + delta));
  const scale = offer.grandTotal > 0 ? grandTotal / offer.grandTotal : 1;
  return {
    ...offer,
    grandTotal,
    adultTotal: Math.max(0, Math.round(offer.adultTotal * scale)),
  };
};

interface SearchContext {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
  children: number;
}

const markupFits = (
  route: FlightRouteDocument,
  markup: MarkupDocument,
  offer: FlightOffer,
  search: SearchContext,
): boolean => {
  if (markup.status !== MARKUP_STATUSES.ENABLE) {
    return false;
  }
  if (!matchesAirline(route.airlines, offer.departing.departure.carrierCode)) {
    return false;
  }
  const start = isoDay(markup.startActiveDate);
  const end = isoDay(markup.endActiveDate);
  if (start && search.departureDate < start) {
    return false;
  }
  if (end && search.departureDate > end) {
    return false;
  }
  if ((markup.blackoutDates ?? []).includes(search.departureDate)) {
    return false;
  }
  if (!matchesDta(markup.dta, search.departureDate)) {
    return false;
  }
  if (!matchesClasses(markup.outboundClasses, offer.departing.departure.cabin)) {
    return false;
  }
  if (offer.returning && !matchesClasses(markup.inboundClasses, offer.returning.departure.cabin)) {
    return false;
  }
  return true;
};

export const applyRouteMarkupToOffers = async (offers: FlightOffer[], search: SearchContext): Promise<FlightOffer[]> => {
  if (!offers.length || !isDatabaseConnected()) {
    return offers;
  }
  try {
    const routes = await FlightRouteModel.find({
      origin: search.origin.toUpperCase(),
      destination: search.destination.toUpperCase(),
      status: ROUTE_STATUSES.ACTIVE,
      isDeleted: { $ne: true },
    });
    if (routes.length === 0) {
      return offers;
    }
    const markups = await MarkupModel.find({
      routeId: { $in: routes.map((route) => route._id) },
      status: MARKUP_STATUSES.ENABLE,
      isDeleted: { $ne: true },
    });
    if (markups.length === 0) {
      return offers;
    }
    const routeById = new Map(routes.map((route) => [String(route._id), route]));
    const paxCount = Math.min(9, Math.max(1, search.adults + search.children));
    return offers.map((offer) => {
      const matches: Array<{ markup: MarkupDocument; specific: boolean }> = [];
      for (const markup of markups) {
        const route = routeById.get(String(markup.routeId));
        if (!route || !markupFits(route, markup, offer, search)) {
          continue;
        }
        matches.push({
          markup,
          specific: tokens(route.airlines).some((code) => code !== 'ALL'),
        });
      }
      matches.sort((left, right) => Number(right.specific) - Number(left.specific));
      const winner = matches[0];
      return winner ? applyOne(offer, winner.markup, paxCount) : offer;
    });
  } catch (err) {
    logger.warn(
      { module: 'markup', err: err instanceof Error ? err.message : 'unknown' },
      'Route markup skipped',
    );
    return offers;
  }
};
