import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ERROR_CODES, USER_ROLES, type AuthUser } from '@best-in-flights-booking/shared-core';
import { isDatabaseConnected, requireDatabase } from '../../config/database.js';
import { getEnv } from '../../config/env.js';
import {
  BCRYPT_ROUNDS,
  BCRYPT_ROUNDS_TEST,
  REFRESH_TOKEN_EXPIRY_MS,
} from '../../shared/constants/index.js';
import { AppError } from '../../shared/errors/app-error.js';
import { createModuleLogger } from '../../shared/logger/logger.js';
import type { AccessTokenPayload } from '../../shared/middleware/authenticate.js';
import { RefreshTokenModel, UserModel, type UserDocument } from './auth.model.js';

const log = createModuleLogger('auth');

const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const bcryptRounds = (): number => {
  return getEnv().NODE_ENV === 'test' ? BCRYPT_ROUNDS_TEST : BCRYPT_ROUNDS;
};

const toAuthUser = (user: UserDocument): AuthUser => {
  const result: AuthUser = {
    id: String(user._id),
    email: user.email,
    role: user.role,
  };
  if (user.fullName) {
    result.fullName = user.fullName;
  }
  return result;
};

const signAccessToken = (user: UserDocument): string => {
  const env = getEnv();
  const payload: AccessTokenPayload = {
    sub: String(user._id),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });
};

const createRefreshToken = async (userId: UserDocument['_id']): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  await RefreshTokenModel.create({
    userId,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });
  return token;
};

export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export const registerUser = async (input: {
  email: string;
  password: string;
  fullName?: string;
}): Promise<AuthSession> => {
  requireDatabase();
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw new AppError(409, ERROR_CODES.DUPLICATE_ENTRY, 'Email is already registered', 'email');
  }

  const passwordHash = await bcrypt.hash(input.password, bcryptRounds());
  const user = await UserModel.create({
    email: input.email,
    passwordHash,
    fullName: input.fullName,
    role: USER_ROLES.USER,
  });

  const token = signAccessToken(user);
  const refreshToken = await createRefreshToken(user._id);
  log.info({ userId: String(user._id) }, 'User registered');
  return { user: toAuthUser(user), token, refreshToken };
};

export const loginUser = async (input: { email: string; password: string }): Promise<AuthSession> => {
  requireDatabase();
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new AppError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new AppError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
  }

  const token = signAccessToken(user);
  const refreshToken = await createRefreshToken(user._id);
  return { user: toAuthUser(user), token, refreshToken };
};

export const refreshSession = async (rawToken: string | undefined): Promise<{ token: string; refreshToken: string }> => {
  if (!rawToken) {
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Refresh token missing');
  }
  requireDatabase();

  const record = await RefreshTokenModel.findOne({ tokenHash: hashRefreshToken(rawToken) });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw new AppError(401, ERROR_CODES.INVALID_TOKEN, 'Refresh token is invalid');
  }

  const user = await UserModel.findById(record.userId);
  if (!user || !user.isActive) {
    await RefreshTokenModel.deleteOne({ _id: record._id });
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'User is not active');
  }

  await RefreshTokenModel.deleteOne({ _id: record._id });
  const token = signAccessToken(user);
  const refreshToken = await createRefreshToken(user._id);
  return { token, refreshToken };
};

export const getCurrentUser = async (userId: string): Promise<AuthUser> => {
  requireDatabase();
  const user = await UserModel.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'User is not active');
  }
  return toAuthUser(user);
};

export const logoutUser = async (rawToken: string | undefined): Promise<void> => {
  if (!rawToken || !isDatabaseConnected()) {
    return;
  }
  await RefreshTokenModel.deleteOne({ tokenHash: hashRefreshToken(rawToken) });
};

export const seedAdminUser = async (): Promise<void> => {
  const env = getEnv();
  const existing = await UserModel.findOne({ role: USER_ROLES.ADMIN });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, bcryptRounds());
  await UserModel.create({
    email: env.ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    fullName: 'Administrator',
    role: USER_ROLES.ADMIN,
  });
  log.info({ email: env.ADMIN_EMAIL }, 'Seeded admin user');
};
