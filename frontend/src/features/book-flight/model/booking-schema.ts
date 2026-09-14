import { z } from 'zod';
import {
  CARD_BRANDS,
  isValidCardHolderName,
  isValidCardNumber,
  isValidCvv,
  isValidExpDate,
} from '@best-in-flights-booking/shared-core';

export const passengerSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter first name'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'Enter last name'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  passengerType: z.enum(['ADULT', 'CHILD', 'INFANT']),
});

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the billing name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(8, 'Enter a valid phone number'),
  country: z.string().trim().min(2, 'Enter country'),
  countryCode: z.string().trim().min(1, 'Enter country code'),
  city: z.string().trim().min(2, 'Enter city'),
  state: z.string().trim().min(2, 'Enter state'),
  address: z.string().trim().min(4, 'Enter address'),
  zip: z.string().trim().min(3, 'Enter PIN / ZIP'),
});

export const cardSchema = z
  .object({
    brand: z.enum(CARD_BRANDS, { errorMap: () => ({ message: 'Select a card' }) }),
    holderName: z.string().trim().min(3, 'Enter the name on the card'),
    number: z.string().trim().min(12, 'Enter the card number'),
    expDate: z.string().trim().min(5, 'Enter expiry as MM/YY'),
    cvv: z.string().trim().min(3, 'Enter CVV'),
  })
  .superRefine((card, ctx) => {
    if (!isValidCardHolderName(card.holderName)) {
      ctx.addIssue({ code: 'custom', path: ['holderName'], message: 'Enter first and last name as printed on the card' });
    }
    if (!isValidCardNumber(card.brand, card.number)) {
      ctx.addIssue({ code: 'custom', path: ['number'], message: 'Enter a valid card number for this brand' });
    }
    if (!isValidExpDate(card.expDate)) {
      ctx.addIssue({ code: 'custom', path: ['expDate'], message: 'Enter a valid expiry (MM/YY)' });
    }
    if (!isValidCvv(card.brand, card.cvv)) {
      ctx.addIssue({ code: 'custom', path: ['cvv'], message: 'Enter a valid CVV' });
    }
  });

export const bookingFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1),
  extras: z.object({
    refundable: z.boolean(),
    addPack: z.boolean(),
  }),
  contact: contactSchema,
  card: cardSchema,
  acceptedTerms: z.boolean().refine((value) => value === true, { message: 'Accept the terms to continue' }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const passengerFullName = (passenger: BookingFormValues['passengers'][number]): string => {
  return [passenger.firstName, passenger.middleName, passenger.lastName].filter(Boolean).join(' ');
};
