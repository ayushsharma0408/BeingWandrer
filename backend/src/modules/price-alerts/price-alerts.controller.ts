import type { Request, Response } from 'express';
import { sendSuccess } from '../../shared/middleware/error-handler.js';
import { createPriceAlert } from './price-alerts.service.js';
import { createPriceAlertSchema } from './price-alerts.validation.js';

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = createPriceAlertSchema.parse({ body: req.body }).body;
  const alert = await createPriceAlert(req.user?.id ?? null, body);
  sendSuccess(res, { alert }, 'Price alert saved', 201);
};
