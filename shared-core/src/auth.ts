export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

export interface AuthTokenPayload {
  user: AuthUser;
  token: string;
}

export interface RefreshTokenPayload {
  token: string;
}

export interface MePayload {
  user: AuthUser;
}
