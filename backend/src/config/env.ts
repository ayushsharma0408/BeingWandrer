import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  FRONTEND_URL: z.string().url(),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  TRAVINUS_BASE_URL: z.string().url().default('https://api.travinus.com'),
  TRAVINUS_PARTNER_ID: z.string().min(1),
  TRAVINUS_CLIENT_ID: z.string().min(1),
  TRAVINUS_CLIENT_SECRET: z.string().min(1),
  TRAVINUS_USE_MOCK: z
    .string()
    .optional()
    .transform((value) => value !== 'false'),
  TRAVINUS_TIMEOUT_MS: z.coerce.number().int().min(1000).default(30_000),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export const getEnv = (): Env => {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${details}`);
  }

  cached = parsed.data;
  return cached;
};

export const resetEnvCache = (): void => {
  cached = undefined;
};
