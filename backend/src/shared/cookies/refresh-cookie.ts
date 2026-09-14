import type { CookieOptions, Request, Response } from 'express';
import { getEnv } from '../../config/env.js';
import { COOKIE, REFRESH_TOKEN_EXPIRY_MS } from '../constants/index.js';

const cookieOptions = (): CookieOptions => {
  const env = getEnv();
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    path: COOKIE.PATH,
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
  };
};

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE.REFRESH_TOKEN, token, cookieOptions());
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(COOKIE.REFRESH_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getEnv().COOKIE_SECURE,
    path: COOKIE.PATH,
  });
};

export const readRefreshCookie = (req: Request): string | undefined => {
  const value = req.cookies?.[COOKIE.REFRESH_TOKEN];
  return typeof value === 'string' ? value : undefined;
};
