import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ERROR_CODES, type UserRole } from '@best-in-flights-booking/shared-core';
import { getEnv } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

const readAccessToken = (req: Request): AccessTokenPayload | null => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length);
  return jwt.verify(token, getEnv().JWT_SECRET) as AccessTokenPayload;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const payload = readAccessToken(req);
    if (!payload) {
      next(AppError.unauthorized());
      return;
    }
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError(401, ERROR_CODES.TOKEN_EXPIRED, 'Access token expired'));
      return;
    }
    next(new AppError(401, ERROR_CODES.INVALID_TOKEN, 'Invalid access token'));
  }
};

export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const payload = readAccessToken(req);
    if (payload) {
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    }
  } catch {
    // Guest checkout continues when a stale token is present.
  }
  next();
};

export const roleGuard = (...roles: UserRole[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(AppError.forbidden());
      return;
    }
    next();
  };
};
