import mongoose from 'mongoose';
import { ERROR_CODES, type AdminInquiryRecord, type AdminUserSummary } from '@best-in-flights-booking/shared-core';
import { requireDatabase } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { UserDocument } from '../auth/auth.model.js';
import { OfferInquiryModel, OfferPageModel, type OfferPageDocument } from './admin.models.js';
import { ACTIVITY, recordActivity } from './activity.service.js';

const toUser = (user: UserDocument | null): AdminUserSummary | null => {
  if (!user) {
    return null;
  }
  const summary: AdminUserSummary = { id: String(user._id), email: user.email, role: user.role };
  if (user.fullName) {
    summary.fullName = user.fullName;
  }
  return summary;
};

const toInquiry = (
  doc: mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    offerPageId?: mongoose.Types.ObjectId | OfferPageDocument | null;
    name: string;
    phone: string;
    email: string;
    passengerCount: number;
    travelDate?: Date;
    assignedTo?: mongoose.Types.ObjectId | UserDocument | null;
    createdAt: Date;
  },
): AdminInquiryRecord => {
  const offerPage = doc.offerPageId && typeof doc.offerPageId === 'object' && 'name' in doc.offerPageId
    ? doc.offerPageId
    : null;
  const assigned = doc.assignedTo && typeof doc.assignedTo === 'object' && 'email' in doc.assignedTo
    ? (doc.assignedTo as UserDocument)
    : null;
  const record: AdminInquiryRecord = {
    id: String(doc._id),
    name: doc.name,
    phone: doc.phone,
    email: doc.email,
    passengerCount: doc.passengerCount,
    assignedTo: toUser(assigned),
    createdAt: doc.createdAt.toISOString(),
  };
  if (offerPage) {
    record.offerPageId = String(offerPage._id);
    record.offerPageName = offerPage.name;
  } else if (doc.offerPageId) {
    record.offerPageId = String(doc.offerPageId);
  }
  if (doc.travelDate) {
    record.travelDate = doc.travelDate.toISOString().slice(0, 10);
  }
  return record;
};

export const listInquiries = async (input: {
  page: number;
  limit: number;
  assignment?: 'assigned' | 'unassigned';
}): Promise<{ items: AdminInquiryRecord[]; total: number }> => {
  requireDatabase();
  const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
  if (input.assignment === 'assigned') {
    filter.assignedTo = { $nin: [null] };
  }
  if (input.assignment === 'unassigned') {
    filter.$or = [{ assignedTo: { $exists: false } }, { assignedTo: null }];
  }

  const [docs, total] = await Promise.all([
    OfferInquiryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .populate<{ offerPageId: OfferPageDocument | null }>('offerPageId', 'name')
      .populate<{ assignedTo: UserDocument | null }>('assignedTo', 'email fullName role'),
    OfferInquiryModel.countDocuments(filter),
  ]);
  return { items: docs.map(toInquiry), total };
};

export const createInquiry = async (input: {
  offerPageId?: string;
  name: string;
  phone: string;
  email: string;
  passengerCount: number;
  travelDate?: string;
}): Promise<AdminInquiryRecord> => {
  requireDatabase();
  if (input.offerPageId) {
    if (!mongoose.isValidObjectId(input.offerPageId)) {
      throw AppError.validation('Invalid offer page', 'offerPageId');
    }
    const offer = await OfferPageModel.findOne({ _id: input.offerPageId, isDeleted: { $ne: true } });
    if (!offer) {
      throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Offer page not found');
    }
  }
  const doc = await OfferInquiryModel.create({
    ...(input.offerPageId ? { offerPageId: input.offerPageId } : {}),
    name: input.name,
    phone: input.phone,
    email: input.email,
    passengerCount: input.passengerCount,
    ...(input.travelDate ? { travelDate: new Date(`${input.travelDate}T00:00:00.000Z`) } : {}),
  });
  const populated = await OfferInquiryModel.findById(doc._id)
    .populate<{ offerPageId: OfferPageDocument | null }>('offerPageId', 'name')
    .populate<{ assignedTo: UserDocument | null }>('assignedTo', 'email fullName role');
  return toInquiry(populated ?? doc);
};

export const assignInquiry = async (actorId: string, inquiryId: string): Promise<AdminInquiryRecord> => {
  requireDatabase();
  if (!mongoose.isValidObjectId(inquiryId)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Inquiry not found');
  }
  const doc = await OfferInquiryModel.findOne({ _id: inquiryId, isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Inquiry not found');
  }
  doc.assignedTo = new mongoose.Types.ObjectId(actorId);
  await doc.save();
  await recordActivity({
    action: `Assigned inquiry ${doc.name}`,
    actionType: ACTIVITY.ASSIGN,
    module: 'OfferInquiry',
    actionBy: actorId,
    refId: String(doc._id),
  });
  const populated = await OfferInquiryModel.findById(doc._id)
    .populate<{ offerPageId: OfferPageDocument | null }>('offerPageId', 'name')
    .populate<{ assignedTo: UserDocument | null }>('assignedTo', 'email fullName role');
  return toInquiry(populated ?? doc);
};
