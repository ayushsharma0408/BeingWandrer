import { z } from 'zod';
import {
  CARD_BRANDS,
  digitsOnly,
  isValidCardHolderName,
  isValidCardNumber,
  isValidCvv,
  isValidExpDate,
} from '@best-in-flights-booking/shared-core';

const passengerSchema = z.object({
  fullName: z.string().trim().min(2),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  passengerType: z.enum(['ADULT', 'CHILD', 'INFANT']),
});

const contactSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8).max(20),
  country: z.string().trim().min(2),
  countryCode: z.string().trim().min(1).max(6),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  address: z.string().trim().min(4),
  zip: z.string().trim().min(3).max(16),
});

const cardSchema = z
  .object({
    brand: z.enum(CARD_BRANDS),
    holderName: z.string().trim().min(3),
    number: z.string().trim().min(12),
    expDate: z.string().trim(),
    cvv: z.string().trim().min(3).max(4),
  })
  .superRefine((card, ctx) => {
    if (!isValidCardHolderName(card.holderName)) {
      ctx.addIssue({ code: 'custom', path: ['holderName'], message: 'Enter the name as printed on the card' });
    }
    if (!isValidCardNumber(card.brand, card.number)) {
      ctx.addIssue({ code: 'custom', path: ['number'], message: 'Enter a valid card number' });
    }
    if (!isValidExpDate(card.expDate)) {
      ctx.addIssue({ code: 'custom', path: ['expDate'], message: 'Enter a valid expiry (MM/YY)' });
    }
    if (!isValidCvv(card.brand, card.cvv)) {
      ctx.addIssue({ code: 'custom', path: ['cvv'], message: 'Enter a valid CVV' });
    }
  });

export const createBookingSchema = z.object({
  body: z.object({
    offerId: z.string().min(1),
    passengers: z.array(passengerSchema).min(1).max(9),
    contact: contactSchema,
    extras: z
      .object({
        refundable: z.boolean().default(false),
        addPack: z.boolean().default(false),
      })
      .default({ refundable: false, addPack: false }),
    card: cardSchema,
  }),
});

export const bookingIdParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listBookingsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(500).default(20),
  }),
});

export type CreateBookingBody = z.infer<typeof createBookingSchema>['body'];

export const toPaymentSummary = (card: CreateBookingBody['card']) => {
  const [expMonth, expYear] = card.expDate.split('/');
  return {
    method: 'CARD' as const,
    brand: card.brand,
    last4: digitsOnly(card.number).slice(-4),
    holderName: card.holderName.trim(),
    expMonth,
    expYear,
  };
};
