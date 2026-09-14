import type { Request, Response } from 'express';
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from '../../shared/cookies/refresh-cookie.js';
import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/middleware/error-handler.js';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from './auth.service.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  const session = await registerUser(req.body);
  setRefreshCookie(res, session.refreshToken);
  sendSuccess(res, { user: session.user, token: session.token }, 'Registration successful', 201);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const session = await loginUser(req.body);
  setRefreshCookie(res, session.refreshToken);
  sendSuccess(res, { user: session.user, token: session.token }, 'Login successful');
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const session = await refreshSession(readRefreshCookie(req));
  setRefreshCookie(res, session.refreshToken);
  sendSuccess(res, { token: session.token }, 'Token refreshed');
};

export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await getCurrentUser(req.user.id);
  sendSuccess(res, { user });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await logoutUser(readRefreshCookie(req));
  clearRefreshCookie(res);
  sendSuccess(res, {}, 'Logged out');
};
