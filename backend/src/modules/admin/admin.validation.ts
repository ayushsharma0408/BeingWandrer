import { z } from 'zod';
import {
  BOOKING_STATUSES,
  MARKUP_STATUSES,
  MARKUP_TYPES,
  META_SEARCH_CHANNELS,
  OFFER_PAGE_STATUSES,
  ROUTE_STATUSES,
  USER_ROLES,
} from '@best-in-flights-booking/shared-core';

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

const staffRole = z.enum([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE]);

export const listQuerySchema = z.object({
  query: z.object({
    ...pagination,
    q: z.string().trim().optional(),
  }),
});

export const staffListQuerySchema = z.object({
  query: z.object({
    ...pagination,
    q: z.string().trim().optional(),
    role: staffRole.optional(),
  }),
});

export const createStaffSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8),
    fullName: z.string().trim().min(1).optional(),
    mobile: z.string().trim().min(6).optional(),
    role: staffRole,
    isActive: z.boolean().optional(),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase().optional(),
    password: z.string().min(8).optional(),
    fullName: z.string().trim().min(1).optional(),
    mobile: z.string().trim().min(6).optional(),
    role: staffRole.optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createCustomerSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8),
    fullName: z.string().trim().min(1).optional(),
    mobile: z.string().trim().min(6).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase().optional(),
    password: z.string().min(8).optional(),
    fullName: z.string().trim().min(1).optional(),
    mobile: z.string().trim().min(6).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const sessionsQuerySchema = z.object({
  query: z.object({
    ...pagination,
    audience: z.enum(['staff', 'customer']).optional(),
  }),
});

export const offerBodySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens'),
    offerLink: z.string().trim().url().optional(),
    description: z.string().trim().optional(),
    imageUrl: z.string().trim().url().optional(),
    publishDate: z.string().min(1),
    status: z.enum([OFFER_PAGE_STATUSES.PUBLISH, OFFER_PAGE_STATUSES.DRAFT]),
    isShowPopup: z.boolean().optional(),
  }),
});

export const updateOfferBodySchema = z.object({
  body: offerBodySchema.shape.body.partial(),
});

export const publicOffersQuerySchema = z.object({
  query: z.object({
    ...pagination,
    popupOnly: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  }),
});

export const searchRecordsQuerySchema = z.object({
  query: z.object({
    ...pagination,
    userId: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const inquiriesQuerySchema = z.object({
  query: z.object({
    ...pagination,
    assignment: z.enum(['assigned', 'unassigned']).optional(),
  }),
});

export const createInquirySchema = z.object({
  body: z.object({
    offerPageId: z.string().optional(),
    name: z.string().trim().min(1),
    phone: z.string().trim().min(6),
    email: z.string().email().trim().toLowerCase(),
    passengerCount: z.coerce.number().int().min(1).max(9),
    travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});

export const bookingsQuerySchema = z.object({
  query: z.object({
    ...pagination,
    q: z.string().trim().optional(),
    status: z.enum(Object.values(BOOKING_STATUSES) as [string, ...string[]]).optional(),
    assignedTo: z.string().optional(),
    customerId: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    isOnline: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  }),
});

export const assignBookingSchema = z.object({
  body: z.object({
    assignedTo: z.string().min(1),
  }),
});

export const bookingStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      BOOKING_STATUSES.PENDING,
      BOOKING_STATUSES.UNASSIGNED,
      BOOKING_STATUSES.ASSIGNED,
      BOOKING_STATUSES.PROCESSING,
      BOOKING_STATUSES.FOLLOW_UP,
      BOOKING_STATUSES.CONFIRMED,
      BOOKING_STATUSES.CANCELLED,
      BOOKING_STATUSES.FAILED,
      BOOKING_STATUSES.CHARGEBACK,
    ]),
    comment: z.string().trim().max(500).optional(),
  }),
});

export const bookingManualSchema = z.object({
  body: z.object({
    issuedPnr: z.string().trim().min(1).optional(),
    mco: z.number().optional().nullable(),
    issuance: z.number().optional().nullable(),
    transaction: z.number().optional().nullable(),
  }),
});

export const routeBodySchema = z.object({
  body: z.object({
    referenceName: z.string().trim().min(1),
    origin: z.string().trim().length(3).toUpperCase(),
    destination: z.string().trim().length(3).toUpperCase(),
    airlines: z.string().trim().min(1).default('ALL'),
    metaSearch: z.literal(META_SEARCH_CHANNELS.D2C).optional(),
    status: z.enum([ROUTE_STATUSES.ACTIVE, ROUTE_STATUSES.INACTIVE]),
  }),
});

export const updateRouteBodySchema = z.object({
  body: routeBodySchema.shape.body.partial(),
});

export const routesQuerySchema = z.object({
  query: z.object({
    ...pagination,
    q: z.string().trim().optional(),
  }),
});

const markupFields = {
  inboundClasses: z.string().trim().min(1, 'Inbound classes are required'),
  outboundClasses: z.string().trim().min(1, 'Outbound classes are required'),
  onePx: z.string().optional(),
  twoPx: z.string().optional(),
  threePx: z.string().optional(),
  fourPx: z.string().optional(),
  fivePx: z.string().optional(),
  sixPx: z.string().optional(),
  sevenPx: z.string().optional(),
  eightPx: z.string().optional(),
  ninePx: z.string().optional(),
  markupAmount: z.coerce.number().finite().gt(0, 'Markup amount must be greater than 0'),
  markupType: z.enum([MARKUP_TYPES.FIXED, MARKUP_TYPES.PERCENTAGE, MARKUP_TYPES.DISCOUNT]),
  startActiveDate: z.string().trim().min(1, 'Start date is required'),
  endActiveDate: z.string().trim().min(1, 'End date is required'),
  dta: z.string().optional(),
  blackoutDates: z.array(z.string()).optional(),
  status: z.enum([MARKUP_STATUSES.ENABLE, MARKUP_STATUSES.DISABLE]).optional(),
};

const markupBodyObjectSchema = z
  .object(markupFields)
  .refine((values) => values.endActiveDate >= values.startActiveDate, {
    message: 'End date must be on or after start date',
    path: ['endActiveDate'],
  });

export const markupBodySchema = z.object({
  body: markupBodyObjectSchema,
});

export const updateMarkupBodySchema = z.object({
  body: z
    .object(markupFields)
    .partial()
    .superRefine((values, ctx) => {
      if (values.startActiveDate && values.endActiveDate && values.endActiveDate < values.startActiveDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be on or after start date',
          path: ['endActiveDate'],
        });
      }
    }),
});
