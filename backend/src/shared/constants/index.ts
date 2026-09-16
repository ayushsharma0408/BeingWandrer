export const API_PREFIX = '/api/v1';

export const AUTH_ROUTES = {
  ROOT: '/auth',
  REGISTER: '/register',
  LOGIN: '/login',
  REFRESH: '/refresh',
  ME: '/me',
  LOGOUT: '/logout',
} as const;

export const FLIGHT_ROUTES = {
  ROOT: '/flights',
  SEARCH: '/search',
  OFFER: '/offers/:offerId',
} as const;

export const BOOKING_ROUTES = {
  ROOT: '/bookings',
} as const;

export const PRICE_ALERT_ROUTES = {
  ROOT: '/price-alerts',
} as const;

export const ADMIN_ROUTES = {
  ROOT: '/admin',
} as const;

export const COOKIE = {
  REFRESH_TOKEN: 'refreshToken',
  PATH: '/api/v1/auth',
} as const;

export const BCRYPT_ROUNDS = 12;
export const BCRYPT_ROUNDS_TEST = 4;

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
export const VISIT_THROTTLE_MS = 30 * 60 * 1000;
