import type { NextFunction, Request, Response } from 'express';
import { ERROR_CODES, type ApiError, type ApiSuccess } from '@best-in-flights-booking/shared-core';
import { AppError } from '../errors/app-error.js';
import { createModuleLogger } from '../logger/logger.js';

const log = createModuleLogger('error-handler');

const isMongoDuplicate = (err: unknown): boolean => {
  return Boolean(err && typeof err === 'object' && 'code' in err && err.code === 11000);
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'Route not found'));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof SyntaxError) {
    const body: ApiError = {
      success: false,
      message: 'Malformed JSON',
      error: { code: ERROR_CODES.BAD_REQUEST, message: 'Malformed JSON' },
    };
    res.status(400).json(body);
    return;
  }

  if (isMongoDuplicate(err)) {
    const body: ApiError = {
      success: false,
      message: 'Resource already exists',
      error: { code: ERROR_CODES.DUPLICATE_ENTRY, message: 'Resource already exists' },
    };
    res.status(409).json(body);
    return;
  }

  if (err instanceof AppError) {
    const body: ApiError = {
      success: false,
      message: err.message,
      error: {
        code: err.code,
        message: err.message,
        ...(err.field ? { field: err.field } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  log.error({ err }, 'Unhandled error');

  const body: ApiError = {
    success: false,
    message: 'Internal server error',
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    },
  };
  res.status(500).json(body);
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = '',
  status = 200,
  meta?: ApiSuccess<T>['meta'],
): Response => {
  const body: ApiSuccess<T> = { success: true, message, data };
  if (meta) {
    body.meta = meta;
  }
  return res.status(status).json(body);
};
