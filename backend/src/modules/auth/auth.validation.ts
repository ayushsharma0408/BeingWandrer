import { z } from 'zod';

const emailField = z.string().email().trim().toLowerCase();
const passwordField = z.string().min(8);

export const registerSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
    fullName: z.string().trim().min(1).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: z.string().min(1),
    portal: z.enum(['admin', 'consumer']).optional(),
  }),
});

export type RegisterBody = z.infer<typeof registerSchema>['body'];
export type LoginBody = z.infer<typeof loginSchema>['body'];
