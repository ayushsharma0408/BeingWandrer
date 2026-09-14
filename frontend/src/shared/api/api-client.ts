import type { ApiResponse } from '@best-in-flights-booking/shared-core';
import { ERROR_CODES } from '@best-in-flights-booking/shared-core';
import { clearAccessToken, getAccessToken, setAccessToken } from '@shared/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  skipRefresh?: boolean;
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly field?: string;
  public readonly status: number;

  public constructor(message: string, code: string, status: number, field?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

const parseBody = async (response: Response): Promise<ApiResponse<unknown>> => {
  return (await response.json()) as ApiResponse<unknown>;
};

let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async (): Promise<boolean> => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      clearAccessToken();
      return false;
    }
    let payload: ApiResponse<unknown>;
    try {
      payload = await parseBody(response);
    } catch {
      clearAccessToken();
      return false;
    }
    if (!payload.success) {
      clearAccessToken();
      return false;
    }
    const data = payload.data as { token: string };
    setAccessToken(data.token);
    return true;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const apiClient = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = getAccessToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiClientError(
      'Cannot reach the booking API. Start it with npm run dev (Mongo is optional for search).',
      ERROR_CODES.UPSTREAM_ERROR,
      503,
    );
  }

  let payload: ApiResponse<unknown>;
  try {
    payload = await parseBody(response);
  } catch {
    throw new ApiClientError(
      'The booking API did not respond. Restart npm run dev and search again.',
      ERROR_CODES.UPSTREAM_ERROR,
      response.status || 503,
    );
  }

  if (
    !payload.success &&
    payload.error.code === ERROR_CODES.TOKEN_EXPIRED &&
    !options.skipRefresh
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiClient<T>(path, { ...options, skipRefresh: true });
    }
  }

  if (!payload.success) {
    throw new ApiClientError(
      payload.error.message,
      payload.error.code,
      response.status,
      payload.error.field,
    );
  }

  return payload.data as T;
};
