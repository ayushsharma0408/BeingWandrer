import { Router } from 'express';
import { AUTH_ROUTES } from '../../shared/constants/index.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import { login, logout, me, refresh, register } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.validation.js';

export const authRouter = Router();

authRouter.post(AUTH_ROUTES.REGISTER, validate(registerSchema), asyncHandler(register));
authRouter.post(AUTH_ROUTES.LOGIN, validate(loginSchema), asyncHandler(login));
authRouter.post(AUTH_ROUTES.REFRESH, asyncHandler(refresh));
authRouter.get(AUTH_ROUTES.ME, authenticate, asyncHandler(me));
authRouter.post(AUTH_ROUTES.LOGOUT, authenticate, asyncHandler(logout));
