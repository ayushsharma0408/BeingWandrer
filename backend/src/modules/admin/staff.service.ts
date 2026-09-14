import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  ERROR_CODES,
  STAFF_ROLES,
  USER_ROLES,
  type AdminCustomerRecord,
  type AdminStaffRecord,
  type UserRole,
} from '@best-in-flights-booking/shared-core';
import { getEnv } from '../../config/env.js';
import { requireDatabase } from '../../config/database.js';
import { BCRYPT_ROUNDS, BCRYPT_ROUNDS_TEST } from '../../shared/constants/index.js';
import { AppError } from '../../shared/errors/app-error.js';
import { UserModel, type UserDocument } from '../auth/auth.model.js';
import { BookingModel } from '../bookings/bookings.model.js';
import { SearchRecordModel } from './admin.models.js';
import { ACTIVITY, recordActivity } from './activity.service.js';

const bcryptRounds = (): number => {
  return getEnv().NODE_ENV === 'test' ? BCRYPT_ROUNDS_TEST : BCRYPT_ROUNDS;
};

const toStaff = (user: UserDocument): AdminStaffRecord => {
  const record: AdminStaffRecord = {
    id: String(user._id),
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    lastLogoutAt: user.lastLogoutAt ? user.lastLogoutAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
  if (user.fullName) {
    record.fullName = user.fullName;
  }
  if (user.mobile) {
    record.mobile = user.mobile;
  }
  return record;
};

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const requireObjectId = (id: string, label: string): mongoose.Types.ObjectId => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, `${label} not found`);
  }
  return new mongoose.Types.ObjectId(id);
};

export const listStaff = async (input: {
  page: number;
  limit: number;
  role?: UserRole;
  q?: string;
}): Promise<{ items: AdminStaffRecord[]; total: number }> => {
  requireDatabase();
  const filter: Record<string, unknown> = {
    isDeleted: { $ne: true },
    role: input.role && STAFF_ROLES.includes(input.role) ? input.role : { $in: [...STAFF_ROLES] },
  };
  if (input.q) {
    const rx = new RegExp(escapeRegex(input.q), 'i');
    filter.$or = [{ email: rx }, { fullName: rx }, { mobile: rx }];
  }

  const [docs, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit),
    UserModel.countDocuments(filter),
  ]);
  return { items: docs.map(toStaff), total };
};

export const getStaff = async (staffId: string): Promise<AdminStaffRecord> => {
  requireDatabase();
  const user = await UserModel.findOne({ _id: requireObjectId(staffId, 'Staff'), isDeleted: { $ne: true } });
  if (!user || !STAFF_ROLES.includes(user.role)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Staff not found');
  }
  return toStaff(user);
};

export const createStaff = async (
  actor: { id: string; role: UserRole },
  input: { email: string; password: string; fullName?: string; mobile?: string; role: UserRole; isActive?: boolean },
): Promise<AdminStaffRecord> => {
  requireDatabase();
  if (!STAFF_ROLES.includes(input.role)) {
    throw AppError.validation('Role must be ADMIN, MANAGER, or EMPLOYEE', 'role');
  }
  if (input.role === USER_ROLES.ADMIN && actor.role !== USER_ROLES.ADMIN) {
    throw AppError.forbidden('Only an admin can create another admin');
  }
  if (actor.role === USER_ROLES.EMPLOYEE) {
    throw AppError.forbidden('Employees cannot create staff');
  }

  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw new AppError(409, ERROR_CODES.DUPLICATE_ENTRY, 'Email is already registered', 'email');
  }

  const user = await UserModel.create({
    email: input.email,
    passwordHash: await bcrypt.hash(input.password, bcryptRounds()),
    fullName: input.fullName,
    mobile: input.mobile,
    role: input.role,
    isActive: input.isActive ?? true,
    createdBy: actor.id,
  });
  await recordActivity({
    action: `Created staff ${user.email}`,
    actionType: ACTIVITY.CREATE,
    module: 'Staff',
    actionBy: actor.id,
    refId: String(user._id),
  });
  return toStaff(user);
};

export const updateStaff = async (
  actor: { id: string; role: UserRole },
  staffId: string,
  input: { fullName?: string; mobile?: string; email?: string; password?: string; role?: UserRole; isActive?: boolean },
): Promise<AdminStaffRecord> => {
  requireDatabase();
  if (actor.role === USER_ROLES.EMPLOYEE) {
    throw AppError.forbidden('Employees cannot edit staff');
  }
  const user = await UserModel.findOne({ _id: requireObjectId(staffId, 'Staff'), isDeleted: { $ne: true } }).select(
    '+passwordHash',
  );
  if (!user || !STAFF_ROLES.includes(user.role)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Staff not found');
  }
  if (input.role && !STAFF_ROLES.includes(input.role)) {
    throw AppError.validation('Role must be ADMIN, MANAGER, or EMPLOYEE', 'role');
  }
  if (input.role === USER_ROLES.ADMIN && actor.role !== USER_ROLES.ADMIN) {
    throw AppError.forbidden('Only an admin can assign the admin role');
  }
  if (input.email && input.email !== user.email) {
    const taken = await UserModel.findOne({ email: input.email, _id: { $ne: user._id } });
    if (taken) {
      throw new AppError(409, ERROR_CODES.DUPLICATE_ENTRY, 'Email is already registered', 'email');
    }
    user.email = input.email;
  }
  if (input.fullName !== undefined) {
    user.fullName = input.fullName;
  }
  if (input.mobile !== undefined) {
    user.mobile = input.mobile;
  }
  if (input.role) {
    user.role = input.role;
  }
  if (input.isActive !== undefined) {
    user.isActive = input.isActive;
  }
  if (input.password) {
    user.passwordHash = await bcrypt.hash(input.password, bcryptRounds());
  }
  await user.save();
  await recordActivity({
    action: `Updated staff ${user.email}`,
    actionType: ACTIVITY.UPDATE,
    module: 'Staff',
    actionBy: actor.id,
    refId: String(user._id),
  });
  return toStaff(user);
};

export const deleteStaff = async (actor: { id: string; role: UserRole }, staffId: string): Promise<void> => {
  requireDatabase();
  if (actor.role !== USER_ROLES.ADMIN) {
    throw AppError.forbidden('Only an admin can delete staff');
  }
  if (actor.id === staffId) {
    throw AppError.validation('You cannot delete your own account');
  }
  const user = await UserModel.findOne({ _id: requireObjectId(staffId, 'Staff'), isDeleted: { $ne: true } });
  if (!user || !STAFF_ROLES.includes(user.role)) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Staff not found');
  }
  user.isDeleted = true;
  user.isActive = false;
  await user.save();
  await recordActivity({
    action: `Deleted staff ${user.email}`,
    actionType: ACTIVITY.DELETE,
    module: 'Staff',
    actionBy: actor.id,
    refId: String(user._id),
  });
};

const toCustomer = (
  user: UserDocument,
  bookingCount: number,
  searchCount: number,
): AdminCustomerRecord => {
  const record: AdminCustomerRecord = {
    id: String(user._id),
    email: user.email,
    isActive: user.isActive,
    bookingCount,
    searchCount,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
  if (user.fullName) {
    record.fullName = user.fullName;
  }
  if (user.mobile) {
    record.mobile = user.mobile;
  }
  return record;
};

export const listCustomers = async (input: {
  page: number;
  limit: number;
  q?: string;
}): Promise<{ items: AdminCustomerRecord[]; total: number }> => {
  requireDatabase();
  const filter: Record<string, unknown> = { role: USER_ROLES.USER, isDeleted: { $ne: true } };
  if (input.q) {
    const rx = new RegExp(escapeRegex(input.q), 'i');
    filter.$or = [{ email: rx }, { fullName: rx }, { mobile: rx }];
  }

  const [docs, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit),
    UserModel.countDocuments(filter),
  ]);

  const ids = docs.map((doc) => doc._id);
  const [bookingCounts, searchCounts] = await Promise.all([
    BookingModel.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { userId: { $in: ids }, isActive: true } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
    SearchRecordModel.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { userId: { $in: ids } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
  ]);

  const bookingMap = new Map(bookingCounts.map((row) => [String(row._id), row.count]));
  const searchMap = new Map(searchCounts.map((row) => [String(row._id), row.count]));

  return {
    total,
    items: docs.map((doc) =>
      toCustomer(doc, bookingMap.get(String(doc._id)) ?? 0, searchMap.get(String(doc._id)) ?? 0),
    ),
  };
};

export const getCustomer = async (customerId: string): Promise<AdminCustomerRecord> => {
  requireDatabase();
  const user = await UserModel.findOne({
    _id: requireObjectId(customerId, 'Customer'),
    role: USER_ROLES.USER,
    isDeleted: { $ne: true },
  });
  if (!user) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Customer not found');
  }
  const [bookingCount, searchCount] = await Promise.all([
    BookingModel.countDocuments({ userId: user._id, isActive: true }),
    SearchRecordModel.countDocuments({ userId: user._id }),
  ]);
  return toCustomer(user, bookingCount, searchCount);
};

export const createCustomer = async (
  actor: { id: string },
  input: { email: string; password: string; fullName?: string; mobile?: string; isActive?: boolean },
): Promise<AdminCustomerRecord> => {
  requireDatabase();
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw new AppError(409, ERROR_CODES.DUPLICATE_ENTRY, 'Email is already registered', 'email');
  }
  const user = await UserModel.create({
    email: input.email,
    passwordHash: await bcrypt.hash(input.password, bcryptRounds()),
    fullName: input.fullName,
    mobile: input.mobile,
    role: USER_ROLES.USER,
    isActive: input.isActive ?? true,
    createdBy: actor.id,
  });
  await recordActivity({
    action: `Created customer ${user.email}`,
    actionType: ACTIVITY.CREATE,
    module: 'Customer',
    actionBy: actor.id,
    refId: String(user._id),
  });
  return toCustomer(user, 0, 0);
};

export const updateCustomer = async (
  actor: { id: string },
  customerId: string,
  input: { fullName?: string; mobile?: string; email?: string; password?: string; isActive?: boolean },
): Promise<AdminCustomerRecord> => {
  requireDatabase();
  const user = await UserModel.findOne({
    _id: requireObjectId(customerId, 'Customer'),
    role: USER_ROLES.USER,
    isDeleted: { $ne: true },
  }).select('+passwordHash');
  if (!user) {
    throw new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Customer not found');
  }
  if (input.email && input.email !== user.email) {
    const taken = await UserModel.findOne({ email: input.email, _id: { $ne: user._id } });
    if (taken) {
      throw new AppError(409, ERROR_CODES.DUPLICATE_ENTRY, 'Email is already registered', 'email');
    }
    user.email = input.email;
  }
  if (input.fullName !== undefined) {
    user.fullName = input.fullName;
  }
  if (input.mobile !== undefined) {
    user.mobile = input.mobile;
  }
  if (input.isActive !== undefined) {
    user.isActive = input.isActive;
  }
  if (input.password) {
    user.passwordHash = await bcrypt.hash(input.password, bcryptRounds());
  }
  await user.save();
  await recordActivity({
    action: `Updated customer ${user.email}`,
    actionType: ACTIVITY.UPDATE,
    module: 'Customer',
    actionBy: actor.id,
    refId: String(user._id),
  });
  const [bookingCount, searchCount] = await Promise.all([
    BookingModel.countDocuments({ userId: user._id, isActive: true }),
    SearchRecordModel.countDocuments({ userId: user._id }),
  ]);
  return toCustomer(user, bookingCount, searchCount);
};
