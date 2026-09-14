import { ERROR_CODES, type ErrorCode } from '@best-in-flights-booking/shared-core';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly field?: string;

  public constructor(statusCode: number, code: ErrorCode, message: string, field?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
  }

  public static validation(message: string, field?: string): AppError {
    return new AppError(422, ERROR_CODES.VALIDATION_ERROR, message, field);
  }

  public static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(401, ERROR_CODES.UNAUTHORIZED, message);
  }

  public static forbidden(message = 'Insufficient permissions'): AppError {
    return new AppError(403, ERROR_CODES.FORBIDDEN, message);
  }
}
