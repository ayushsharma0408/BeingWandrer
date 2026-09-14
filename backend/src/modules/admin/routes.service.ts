import mongoose from 'mongoose';
import {
  ERROR_CODES,
  META_SEARCH_CHANNELS,
  type AdminMarkupRecord,
  type AdminRouteRecord,
  type MarkupStatus,
  type MarkupType,
  type RouteStatus,
} from '@best-in-flights-booking/shared-core';
import { requireDatabase } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import { clearOfferCache } from '../flights/offer-cache.js';
import { FlightRouteModel, MarkupModel, type FlightRouteDocument, type MarkupDocument } from './admin.models.js';
import { describeMarkup, describeRoute } from './activity-copy.js';
import { ACTIVITY, recordActivity } from './activity.service.js';

const toRoute = (doc: FlightRouteDocument): AdminRouteRecord => ({
  id: String(doc._id),
  referenceName: doc.referenceName,
  origin: doc.origin,
  destination: doc.destination,
  airlines: doc.airlines,
  metaSearch: doc.metaSearch,
  status: doc.status,
  createdAt: doc.createdAt.toISOString(),
});

const dateOnly = (value?: Date): string | undefined => {
  return value ? value.toISOString().slice(0, 10) : undefined;
};

const toMarkup = (doc: MarkupDocument): AdminMarkupRecord => {
  const record: AdminMarkupRecord = {
    id: String(doc._id),
    routeId: String(doc.routeId),
    inboundClasses: doc.inboundClasses,
    outboundClasses: doc.outboundClasses,
    markupAmount: doc.markupAmount,
    markupType: doc.markupType,
    blackoutDates: doc.blackoutDates,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
  if (doc.onePx) record.onePx = doc.onePx;
  if (doc.twoPx) record.twoPx = doc.twoPx;
  if (doc.threePx) record.threePx = doc.threePx;
  if (doc.fourPx) record.fourPx = doc.fourPx;
  if (doc.fivePx) record.fivePx = doc.fivePx;
  if (doc.sixPx) record.sixPx = doc.sixPx;
  if (doc.sevenPx) record.sevenPx = doc.sevenPx;
  if (doc.eightPx) record.eightPx = doc.eightPx;
  if (doc.ninePx) record.ninePx = doc.ninePx;
  const start = dateOnly(doc.startActiveDate);
  const end = dateOnly(doc.endActiveDate);
  if (start) record.startActiveDate = start;
  if (end) record.endActiveDate = end;
  if (doc.dta) record.dta = doc.dta;
  return record;
};

const requireRouteId = (id: string): mongoose.Types.ObjectId => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Route not found');
  }
  return new mongoose.Types.ObjectId(id);
};

export const listRoutes = async (input: {
  page: number;
  limit: number;
  q?: string;
}): Promise<{ items: AdminRouteRecord[]; total: number }> => {
  requireDatabase();
  const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
  if (input.q) {
    const rx = new RegExp(input.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ referenceName: rx }, { origin: rx }, { destination: rx }, { airlines: rx }];
  }
  const [docs, total] = await Promise.all([
    FlightRouteModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit),
    FlightRouteModel.countDocuments(filter),
  ]);
  return { items: docs.map(toRoute), total };
};

export const getRoute = async (routeId: string): Promise<AdminRouteRecord> => {
  requireDatabase();
  const doc = await FlightRouteModel.findOne({ _id: requireRouteId(routeId), isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Route not found');
  }
  return toRoute(doc);
};

export const createRoute = async (
  actorId: string,
  input: {
    referenceName: string;
    origin: string;
    destination: string;
    airlines: string;
    status: RouteStatus;
  },
): Promise<AdminRouteRecord> => {
  requireDatabase();
  const doc = await FlightRouteModel.create({
    ...input,
    metaSearch: META_SEARCH_CHANNELS.D2C,
    createdBy: actorId,
  });
  await recordActivity({
    action: `Created route ${describeRoute(doc)}`,
    actionType: ACTIVITY.CREATE,
    module: 'Route',
    actionBy: actorId,
    refId: String(doc._id),
  });
  await clearOfferCache();
  return toRoute(doc);
};

export const updateRoute = async (
  actorId: string,
  routeId: string,
  input: Partial<{
    referenceName: string;
    origin: string;
    destination: string;
    airlines: string;
    status: RouteStatus;
  }>,
): Promise<AdminRouteRecord> => {
  requireDatabase();
  const doc = await FlightRouteModel.findOne({ _id: requireRouteId(routeId), isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Route not found');
  }
  Object.assign(doc, input);
  doc.metaSearch = META_SEARCH_CHANNELS.D2C;
  await doc.save();
  await recordActivity({
    action: `Updated route ${describeRoute(doc)}`,
    actionType: ACTIVITY.UPDATE,
    module: 'Route',
    actionBy: actorId,
    refId: String(doc._id),
  });
  await clearOfferCache();
  return toRoute(doc);
};

export const deleteRoute = async (actorId: string, routeId: string): Promise<void> => {
  requireDatabase();
  const doc = await FlightRouteModel.findOne({ _id: requireRouteId(routeId), isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Route not found');
  }
  doc.isDeleted = true;
  await doc.save();
  await MarkupModel.updateMany({ routeId: doc._id }, { isDeleted: true });
  await recordActivity({
    action: `Deleted route ${describeRoute(doc)}`,
    actionType: ACTIVITY.DELETE,
    module: 'Route',
    actionBy: actorId,
    refId: String(doc._id),
  });
  await clearOfferCache();
};

export const listMarkups = async (
  routeId: string,
  page: number,
  limit: number,
): Promise<{ items: AdminMarkupRecord[]; total: number }> => {
  requireDatabase();
  await getRoute(routeId);
  const filter = { routeId: requireRouteId(routeId), isDeleted: { $ne: true } };
  const [docs, total] = await Promise.all([
    MarkupModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    MarkupModel.countDocuments(filter),
  ]);
  return { items: docs.map(toMarkup), total };
};

export const getMarkup = async (markupId: string): Promise<AdminMarkupRecord> => {
  requireDatabase();
  if (!mongoose.isValidObjectId(markupId)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Markup not found');
  }
  const doc = await MarkupModel.findOne({ _id: markupId, isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Markup not found');
  }
  return toMarkup(doc);
};

export interface MarkupInput {
  inboundClasses?: string;
  outboundClasses?: string;
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
  blackoutDates?: string[];
  status?: MarkupStatus;
}

export const createMarkup = async (
  actorId: string,
  routeId: string,
  input: MarkupInput,
): Promise<AdminMarkupRecord> => {
  requireDatabase();
  const optional = (value?: string): string | undefined => {
    const trimmed = value?.trim() ?? '';
    return trimmed || undefined;
  };

  const route = await getRoute(routeId);
  const doc = await MarkupModel.create({
    routeId,
    inboundClasses: input.inboundClasses?.trim() ?? '',
    outboundClasses: input.outboundClasses?.trim() ?? '',
    onePx: optional(input.onePx),
    twoPx: optional(input.twoPx),
    threePx: optional(input.threePx),
    fourPx: optional(input.fourPx),
    fivePx: optional(input.fivePx),
    sixPx: optional(input.sixPx),
    sevenPx: optional(input.sevenPx),
    eightPx: optional(input.eightPx),
    ninePx: optional(input.ninePx),
    markupAmount: input.markupAmount,
    markupType: input.markupType,
    startActiveDate: input.startActiveDate ? new Date(input.startActiveDate) : undefined,
    endActiveDate: input.endActiveDate ? new Date(input.endActiveDate) : undefined,
    dta: optional(input.dta),
    blackoutDates: input.blackoutDates ?? [],
    status: input.status ?? 'ENABLE',
    createdBy: actorId,
  });
  await recordActivity({
    action: `Added ${describeMarkup(doc, route)}`,
    actionType: ACTIVITY.CREATE,
    module: 'Markup',
    actionBy: actorId,
    refId: String(doc._id),
  });
  await clearOfferCache();
  return toMarkup(doc);
};

export const updateMarkup = async (
  actorId: string,
  markupId: string,
  input: Partial<MarkupInput>,
): Promise<AdminMarkupRecord> => {
  requireDatabase();
  if (!mongoose.isValidObjectId(markupId)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Markup not found');
  }
  const doc = await MarkupModel.findOne({ _id: markupId, isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Markup not found');
  }
  if (input.inboundClasses !== undefined) doc.inboundClasses = input.inboundClasses;
  if (input.outboundClasses !== undefined) doc.outboundClasses = input.outboundClasses;
  if (input.onePx !== undefined) doc.onePx = input.onePx;
  if (input.twoPx !== undefined) doc.twoPx = input.twoPx;
  if (input.threePx !== undefined) doc.threePx = input.threePx;
  if (input.fourPx !== undefined) doc.fourPx = input.fourPx;
  if (input.fivePx !== undefined) doc.fivePx = input.fivePx;
  if (input.sixPx !== undefined) doc.sixPx = input.sixPx;
  if (input.sevenPx !== undefined) doc.sevenPx = input.sevenPx;
  if (input.eightPx !== undefined) doc.eightPx = input.eightPx;
  if (input.ninePx !== undefined) doc.ninePx = input.ninePx;
  if (input.markupAmount !== undefined) doc.markupAmount = input.markupAmount;
  if (input.markupType !== undefined) doc.markupType = input.markupType;
  if (input.startActiveDate !== undefined) {
    doc.startActiveDate = input.startActiveDate ? new Date(input.startActiveDate) : undefined;
  }
  if (input.endActiveDate !== undefined) {
    doc.endActiveDate = input.endActiveDate ? new Date(input.endActiveDate) : undefined;
  }
  if (input.dta !== undefined) doc.dta = input.dta;
  if (input.blackoutDates !== undefined) doc.blackoutDates = input.blackoutDates;
  if (input.status !== undefined) doc.status = input.status;
  await doc.save();
  const route = await FlightRouteModel.findById(doc.routeId);
  await recordActivity({
    action: `Updated ${describeMarkup(doc, route)}`,
    actionType: ACTIVITY.UPDATE,
    module: 'Markup',
    actionBy: actorId,
    refId: markupId,
  });
  await clearOfferCache();
  return toMarkup(doc);
};

export const deleteMarkup = async (actorId: string, markupId: string): Promise<void> => {
  requireDatabase();
  if (!mongoose.isValidObjectId(markupId)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Markup not found');
  }
  const doc = await MarkupModel.findOne({ _id: markupId, isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Markup not found');
  }
  const route = await FlightRouteModel.findById(doc.routeId);
  doc.isDeleted = true;
  await doc.save();
  await recordActivity({
    action: `Deleted ${describeMarkup(doc, route)}`,
    actionType: ACTIVITY.DELETE,
    module: 'Markup',
    actionBy: actorId,
    refId: markupId,
  });
  await clearOfferCache();
};
