import { z } from 'zod';

export const flightSearchSchema = z
  .object({
    origin: z.string().trim().toUpperCase().length(3, 'Use a 3-letter airport code'),
    destination: z.string().trim().toUpperCase().length(3, 'Use a 3-letter airport code'),
    departureDate: z.string().min(1, 'Departure date is required'),
    returnDate: z.string().optional(),
    adults: z.coerce.number().int().min(1).max(9),
    children: z.coerce.number().int().min(0).max(8),
    infants: z.coerce.number().int().min(0).max(8),
    travelClass: z.enum(['Economy', 'PremiumEconomy', 'Business', 'First']),
    flightMode: z.enum(['OneWay', 'Return']),
  })
  .refine((value) => value.origin.toUpperCase() !== value.destination.toUpperCase(), {
    message: 'Origin and destination must differ',
    path: ['destination'],
  })
  .refine((value) => value.flightMode !== 'Return' || Boolean(value.returnDate), {
    message: 'Return date is required',
    path: ['returnDate'],
  });

export type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;
