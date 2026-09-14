import { z } from 'zod';

export const priceAlertSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

export type PriceAlertFormValues = z.infer<typeof priceAlertSchema>;
