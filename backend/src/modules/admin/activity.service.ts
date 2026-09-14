import {
  ACCESS_TYPES,
  ACTIVITY_TYPES,
  STAFF_ROLES,
  USER_ROLES,
  type AccessType,
  type ActivityType,
  type AdminAccessRecord,
  type AdminActivityRecord,
  type AdminUserSummary,
  type UserRole,
} from '@best-in-flights-booking/shared-core';
import mongoose from 'mongoose';
import { isDatabaseConnected, requireDatabase } from '../../config/database.js';
import { VISIT_THROTTLE_MS } from '../../shared/constants/index.js';
import { createModuleLogger } from '../../shared/logger/logger.js';
import type { UserDocument } from '../auth/auth.model.js';
import { BookingModel } from '../bookings/bookings.model.js';
import { AccessRecordModel, ActivityLogModel, FlightRouteModel, MarkupModel } from './admin.models.js';
import { describeLogin, describeMarkup, describeRoute } from './activity-copy.js';

const log = createModuleLogger('admin-activity');

const toUserSummary = (user: { _id: unknown; email?: string; fullName?: string; role?: UserRole } | null): AdminUserSummary | null => {
  if (!user || !user.email || !user.role) {
    return null;
  }
  const summary: AdminUserSummary = {
    id: String(user._id),
    email: user.email,
    role: user.role,
  };
  if (user.fullName) {
    summary.fullName = user.fullName;
  }
  return summary;
};

export const recordActivity = async (input: {
  action: string;
  actionType: ActivityType;
  module: string;
  actionBy?: string;
  refId?: string;
}): Promise<void> => {
  if (!isDatabaseConnected()) {
    return;
  }
  try {
    await ActivityLogModel.create({
      action: input.action,
      actionType: input.actionType,
      module: input.module,
      ...(input.actionBy ? { actionBy: input.actionBy } : {}),
      ...(input.refId ? { refId: input.refId } : {}),
    });
  } catch (err) {
    log.warn({ err }, 'Failed to write activity log');
  }
};

export const recordAccess = async (input: {
  userId?: string;
  visitorId?: string;
  accessType: AccessType;
  ipAddress: string;
}): Promise<void> => {
  if (!isDatabaseConnected()) {
    return;
  }
  try {
    await AccessRecordModel.create({
      accessType: input.accessType,
      ipAddress: input.ipAddress,
      ...(input.userId ? { userId: input.userId } : {}),
      ...(input.visitorId ? { visitorId: input.visitorId } : {}),
    });
  } catch (err) {
    log.warn({ err }, 'Failed to write access record');
  }
};

export const recordSiteVisit = async (input: {
  visitorId: string;
  userId?: string;
  accessType: AccessType;
  ipAddress: string;
}): Promise<{ visitorId: string; ipAddress: string }> => {
  if (!isDatabaseConnected()) {
    return { visitorId: input.visitorId, ipAddress: input.ipAddress };
  }

  const recent = await AccessRecordModel.findOne({
    visitorId: input.visitorId,
    accessType: input.accessType,
    createdAt: { $gte: new Date(Date.now() - VISIT_THROTTLE_MS) },
  }).sort({ createdAt: -1 });

  if (recent) {
    recent.ipAddress = input.ipAddress;
    if (input.userId) {
      recent.userId = new mongoose.Types.ObjectId(input.userId);
    }
    await recent.save();
    return { visitorId: input.visitorId, ipAddress: input.ipAddress };
  }

  await recordAccess(input);
  return { visitorId: input.visitorId, ipAddress: input.ipAddress };
};

const isObjectId = (value?: string): value is string => Boolean(value && /^[a-f0-9]{24}$/i.test(value));

const OBJECT_ID_IN_TEXT = /\b[a-f0-9]{24}\b/gi;

const friendlyAction = (
  action: string,
  module: string,
  actionType: ActivityType,
  refId: string | undefined,
  lookup: {
    markups: Map<string, { markupType: string; markupAmount: number; routeId: string }>;
    routes: Map<string, { referenceName: string; origin: string; destination: string }>;
    bookings: Map<string, { pnr: string | null }>;
  },
): string => {
  if (module === 'Markup') {
    const markup = refId ? lookup.markups.get(refId) : undefined;
    if (markup) {
      const route = lookup.routes.get(markup.routeId);
      const label = describeMarkup(markup, route);
      if (actionType === ACTIVITY_TYPES.CREATE) {
        return `Added ${label}`;
      }
      if (actionType === ACTIVITY_TYPES.DELETE) {
        return `Deleted ${label}`;
      }
      return `Updated ${label}`;
    }
  }

  if (module === 'Route') {
    const route = refId ? lookup.routes.get(refId) : undefined;
    if (route) {
      const label = describeRoute(route);
      if (actionType === ACTIVITY_TYPES.CREATE) {
        return `Created route ${label}`;
      }
      if (actionType === ACTIVITY_TYPES.DELETE) {
        return `Deleted route ${label}`;
      }
      return `Updated route ${label}`;
    }
  }

  if (module === 'Booking') {
    const booking = refId ? lookup.bookings.get(refId) : undefined;
    const locator = booking?.pnr;
    if (locator) {
      return action.replace(OBJECT_ID_IN_TEXT, locator);
    }
  }

  if (module === 'Auth') {
    return describeLogin(action);
  }

  return action.replace(OBJECT_ID_IN_TEXT, '').replace(/\s{2,}/g, ' ').trim();
};

export const listActivityLogs = async (
  page: number,
  limit: number,
): Promise<{ items: AdminActivityRecord[]; total: number }> => {
  requireDatabase();
  const [docs, total] = await Promise.all([
    ActivityLogModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate<{ actionBy: UserDocument | null }>('actionBy', 'email fullName role'),
    ActivityLogModel.countDocuments(),
  ]);

  const markupIds = docs.filter((doc) => doc.module === 'Markup' && isObjectId(doc.refId)).map((doc) => doc.refId as string);
  const routeIds = docs.filter((doc) => doc.module === 'Route' && isObjectId(doc.refId)).map((doc) => doc.refId as string);
  const bookingIds = docs.filter((doc) => doc.module === 'Booking' && isObjectId(doc.refId)).map((doc) => doc.refId as string);

  const [markups, routes, bookings] = await Promise.all([
    markupIds.length ? MarkupModel.find({ _id: { $in: markupIds } }) : [],
    routeIds.length ? FlightRouteModel.find({ _id: { $in: routeIds } }) : [],
    bookingIds.length ? BookingModel.find({ _id: { $in: bookingIds } }).select('pnr') : [],
  ]);

  const extraRouteIds = markups.map((markup) => String(markup.routeId)).filter((id) => !routeIds.includes(id));
  const extraRoutes = extraRouteIds.length ? await FlightRouteModel.find({ _id: { $in: extraRouteIds } }) : [];

  const lookup = {
    markups: new Map(
      markups.map((markup) => [
        String(markup._id),
        { markupType: markup.markupType, markupAmount: markup.markupAmount, routeId: String(markup.routeId) },
      ]),
    ),
    routes: new Map(
      [...routes, ...extraRoutes].map((route) => [
        String(route._id),
        { referenceName: route.referenceName, origin: route.origin, destination: route.destination },
      ]),
    ),
    bookings: new Map(bookings.map((booking) => [String(booking._id), { pnr: booking.pnr }])),
  };

  return {
    total,
    items: docs.map((doc) => {
      const item: AdminActivityRecord = {
        id: String(doc._id),
        action: friendlyAction(doc.action, doc.module, doc.actionType, doc.refId, lookup),
        actionType: doc.actionType,
        module: doc.module,
        actionBy: toUserSummary(doc.actionBy),
        createdAt: doc.createdAt.toISOString(),
      };
      if (doc.refId) {
        item.refId = doc.refId;
      }
      return item;
    }),
  };
};

export const listAccessRecords = async (
  page: number,
  limit: number,
  audience?: 'staff' | 'customer',
): Promise<{ items: AdminAccessRecord[]; total: number }> => {
  requireDatabase();
  const match: Record<string, unknown> = {};
  if (audience === 'staff') {
    match.accessType = ACCESS_TYPES.ADMIN_PORTAL;
  }
  if (audience === 'customer') {
    match.accessType = ACCESS_TYPES.CONSUMER;
  }

  const [docs, total] = await Promise.all([
    AccessRecordModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate<{ userId: UserDocument | null }>('userId', 'email fullName role'),
    AccessRecordModel.countDocuments(match),
  ]);

  const items = docs
    .filter((doc) => {
      const role = doc.userId?.role;
      if (!role) {
        return true;
      }
      if (audience === 'staff') {
        return STAFF_ROLES.includes(role);
      }
      if (audience === 'customer') {
        return role === USER_ROLES.USER;
      }
      return true;
    })
    .map((doc) => {
      const item: AdminAccessRecord = {
        id: String(doc._id),
        user: toUserSummary(doc.userId),
        accessType: doc.accessType,
        ipAddress: doc.ipAddress,
        createdAt: doc.createdAt.toISOString(),
      };
      if (doc.visitorId) {
        item.visitorId = doc.visitorId;
      }
      return item;
    });

  return { items, total };
};

export const ACTIVITY = ACTIVITY_TYPES;
