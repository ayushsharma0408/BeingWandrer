import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const createPriceAlertSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email(),
      origin: z.string().trim().length(3).toUpperCase(),
      destination: z.string().trim().length(3).toUpperCase(),
      departureDate: isoDate,
      returnDate: isoDate.optional(),
      flightMode: z.enum(['OneWay', 'Return']).default('OneWay'),
      currency: z.string().trim().length(3).toUpperCase().default('INR'),
      currentPrice: z.number().positive(),
    })
    .superRefine((value, ctx) => {
      if (value.origin === value.destination) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Origin and destination must differ',
          path: ['destination'],
        });
      }
      if (value.flightMode === 'Return' && !value.returnDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Return date is required for round trips',
          path: ['returnDate'],
        });
      }
    }),
});

export type CreatePriceAlertBody = z.infer<typeof createPriceAlertSchema>['body'];
