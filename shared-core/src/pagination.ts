export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 500,
  SORT: 'createdAt',
  ORDER: 'desc',
} as const;
