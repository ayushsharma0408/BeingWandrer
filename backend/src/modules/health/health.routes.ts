import { Router } from 'express';
import { isDatabaseConnected } from '../../config/database.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { sendSuccess } from '../../shared/middleware/error-handler.js';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    sendSuccess(
      res,
      {
        status: 'ok',
        uptimeSec: Math.floor(process.uptime()),
        mongo: isDatabaseConnected(),
      },
      'OK',
    );
  }),
);
