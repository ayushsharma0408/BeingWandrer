export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const STAFF_ROLES: readonly UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.EMPLOYEE,
];

export const isStaffRole = (role: UserRole): boolean => {
  return STAFF_ROLES.includes(role);
};

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

export interface VisitPayload {
  visitorId: string;
  ipAddress: string;
}
