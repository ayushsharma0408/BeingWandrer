import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../errors/app-error.js';

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue?.path.filter((part) => part !== 'body').join('.') || undefined;
      next(AppError.validation(issue?.message ?? 'Validation failed', field));
      return;
    }

    next();
  };
};
