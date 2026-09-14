import type { Request, Response } from 'express';
import { sendSuccess } from '../../shared/middleware/error-handler.js';
import { getCachedOffer, searchFlights } from './flights.service.js';
import { searchFlightsSchema } from './flights.validation.js';

export const search = async (req: Request, res: Response): Promise<void> => {
  const query = searchFlightsSchema.parse({ query: req.query }).query;
  const result = await searchFlights(query);
  sendSuccess(
    res,
    { count: result.total, offers: result.offers },
    '',
    200,
    {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit) || 0,
    },
  );
};

export const getOffer = async (req: Request, res: Response): Promise<void> => {
  const offer = await getCachedOffer(String(req.params.offerId));
  sendSuccess(res, { offer });
};
