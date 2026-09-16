import type { AuthTokenPayload, MePayload, RefreshTokenPayload } from '@best-in-flights-booking/shared-core';
import { apiClient } from '@shared/api';

export const registerUserApi = (body: {
  email: string;
  password: string;
  fullName?: string;
}): Promise<AuthTokenPayload> => {
  return apiClient<AuthTokenPayload>('/api/v1/auth/register', { method: 'POST', body });
};

export const loginUserApi = (body: {
  email: string;
  password: string;
  portal?: 'admin' | 'consumer';
}): Promise<AuthTokenPayload> => {
  return apiClient<AuthTokenPayload>('/api/v1/auth/login', { method: 'POST', body });
};

export const refreshSessionApi = (): Promise<RefreshTokenPayload> => {
  return apiClient<RefreshTokenPayload>('/api/v1/auth/refresh', { method: 'POST', skipRefresh: true });
};

export const getMeApi = (): Promise<MePayload> => {
  return apiClient<MePayload>('/api/v1/auth/me');
};

export const logoutUserApi = (): Promise<Record<string, never>> => {
  return apiClient<Record<string, never>>('/api/v1/auth/logout', { method: 'POST' });
};
