import mongoose from 'mongoose';
import {
  ERROR_CODES,
  OFFER_PAGE_STATUSES,
  type AdminOfferPageRecord,
  type OfferPageStatus,
} from '@best-in-flights-booking/shared-core';
import { requireDatabase } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import { OfferPageModel, type OfferPageDocument } from './admin.models.js';
import { ACTIVITY, recordActivity } from './activity.service.js';

const publishedFilter = (extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  isDeleted: { $ne: true },
  status: OFFER_PAGE_STATUSES.PUBLISH,
  publishDate: { $lte: new Date() },
  ...extra,
});

const toOffer = (doc: OfferPageDocument): AdminOfferPageRecord => {
  const record: AdminOfferPageRecord = {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    publishDate: doc.publishDate.toISOString(),
    status: doc.status,
    isShowPopup: doc.isShowPopup,
    createdAt: doc.createdAt.toISOString(),
  };
  if (doc.offerLink) {
    record.offerLink = doc.offerLink;
  }
  if (doc.description) {
    record.description = doc.description;
  }
  if (doc.imageUrl) {
    record.imageUrl = doc.imageUrl;
  }
  return record;
};

const requireOfferId = (id: string): mongoose.Types.ObjectId => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Offer page not found');
  }
  return new mongoose.Types.ObjectId(id);
};

export const listOfferPages = async (input: {
  page: number;
  limit: number;
  q?: string;
}): Promise<{ items: AdminOfferPageRecord[]; total: number }> => {
  requireDatabase();
  const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
  if (input.q) {
    filter.$or = [
      { name: new RegExp(input.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { slug: new RegExp(input.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ];
  }
  const [docs, total] = await Promise.all([
    OfferPageModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit),
    OfferPageModel.countDocuments(filter),
  ]);
  return { items: docs.map(toOffer), total };
};

export const getOfferPage = async (offerId: string): Promise<AdminOfferPageRecord> => {
  requireDatabase();
  const doc = await OfferPageModel.findOne({ _id: requireOfferId(offerId), isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Offer page not found');
  }
  return toOffer(doc);
};

export const listPublishedOfferPages = async (input: {
  page: number;
  limit: number;
  popupOnly?: boolean;
}): Promise<{ items: AdminOfferPageRecord[]; total: number }> => {
  requireDatabase();
  const filter = publishedFilter(input.popupOnly ? { isShowPopup: true } : {});
  const [docs, total] = await Promise.all([
    OfferPageModel.find(filter)
      .sort({ publishDate: -1, createdAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit),
    OfferPageModel.countDocuments(filter),
  ]);
  return { items: docs.map(toOffer), total };
};

export const getPublishedOfferPageBySlug = async (slug: string): Promise<AdminOfferPageRecord> => {
  requireDatabase();
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Offer page not found');
  }
  const doc = await OfferPageModel.findOne(publishedFilter({ slug: normalized }));
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Offer page not found');
  }
  return toOffer(doc);
};

export const createOfferPage = async (
  actorId: string,
  input: {
    name: string;
    slug: string;
    offerLink?: string;
    description?: string;
    imageUrl?: string;
    publishDate: string;
    status: OfferPageStatus;
    isShowPopup?: boolean;
  },
): Promise<AdminOfferPageRecord> => {
  requireDatabase();
  const doc = await OfferPageModel.create({
    name: input.name,
    slug: input.slug,
    offerLink: input.offerLink,
    description: input.description,
    imageUrl: input.imageUrl,
    publishDate: new Date(input.publishDate),
    status: input.status,
    isShowPopup: input.isShowPopup ?? false,
    createdBy: actorId,
  });
  await recordActivity({
    action: `Created offer page ${doc.name}`,
    actionType: ACTIVITY.CREATE,
    module: 'OfferPage',
    actionBy: actorId,
    refId: String(doc._id),
  });
  return toOffer(doc);
};

export const updateOfferPage = async (
  actorId: string,
  offerId: string,
  input: {
    name?: string;
    slug?: string;
    offerLink?: string;
    description?: string;
    imageUrl?: string;
    publishDate?: string;
    status?: OfferPageStatus;
    isShowPopup?: boolean;
  },
): Promise<AdminOfferPageRecord> => {
  requireDatabase();
  const doc = await OfferPageModel.findOne({ _id: requireOfferId(offerId), isDeleted: { $ne: true } });
  if (!doc) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Offer page not found');
  }
  if (input.name !== undefined) {
    doc.name = input.name;
  }
  if (input.slug !== undefined) {
    doc.slug = input.slug;
  }
  if (input.offerLink !== undefined) {
    doc.offerLink = input.offerLink;
  }
  if (input.description !== undefined) {
    doc.description = input.description;
  }
  if (input.imageUrl !== undefined) {
    doc.imageUrl = input.imageUrl;
  }
  if (input.publishDate !== undefined) {
    doc.publishDate = new Date(input.publishDate);
  }
  if (input.status !== undefined) {
    doc.status = input.status;
  }
  if (input.isShowPopup !== undefined) {
    doc.isShowPopup = input.isShowPopup;
  }
  await doc.save();
  await recordActivity({
    action: `Updated offer page ${doc.name}`,
    actionType: ACTIVITY.UPDATE,
    module: 'OfferPage',
    actionBy: actorId,
    refId: String(doc._id),
  });
  return toOffer(doc);
};
