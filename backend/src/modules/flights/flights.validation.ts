import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const searchFlightsSchema = z.object({
  query: z
    .object({
      origin: z.string().trim().length(3).toUpperCase(),
      destination: z.string().trim().length(3).toUpperCase(),
      departureDate: isoDate,
      returnDate: isoDate.optional(),
      adults: z.coerce.number().int().min(1).max(9).default(1),
      children: z.coerce.number().int().min(0).max(8).default(0),
      infants: z.coerce.number().int().min(0).max(8).default(0),
      currency: z.string().trim().length(3).toUpperCase().default('INR'),
      travelClass: z.enum(['Economy', 'PremiumEconomy', 'Business', 'First']).default('Economy'),
      flightMode: z.enum(['OneWay', 'Return']).default('OneWay'),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(500).default(500),
    })
    .superRefine((value, ctx) => {
      if (value.origin === value.destination) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Origin and destination must differ', path: ['destination'] });
      }
      if (value.flightMode === 'Return' && !value.returnDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Return date is required for round trips', path: ['returnDate'] });
      }
      if (value.infants > value.adults) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Infants cannot exceed adults', path: ['infants'] });
      }
    }),
});

export const offerParamsSchema = z.object({
  params: z.object({
    offerId: z.string().min(1),
  }),
});

export type SearchFlightsQuery = z.infer<typeof searchFlightsSchema>['query'];
