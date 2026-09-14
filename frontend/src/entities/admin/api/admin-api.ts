import type {
  AdminAccessRecord,
  AdminActivityRecord,
  AdminBookingRecord,
  AdminCustomerRecord,
  AdminDashboardCounts,
  AdminInquiryRecord,
  AdminLifecycleRecord,
  AdminMarkupRecord,
  AdminOfferPageRecord,
  AdminRouteRecord,
  AdminSearchRecord,
  AdminStaffRecord,
  AdminUserSummary,
  BookingStatus,
  MarkupStatus,
  MarkupType,
  OfferPageStatus,
  RouteStatus,
  UserRole,
} from '@best-in-flights-booking/shared-core';
import { apiClient } from '@shared/api';

export interface AdminListResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const qs = (params: Record<string, string | number | boolean | undefined>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
};

export const getAdminDashboardApi = (): Promise<{ counts: AdminDashboardCounts }> => {
  return apiClient<{ counts: AdminDashboardCounts }>('/api/v1/admin/dashboard');
};

export const listStaffApi = (params: {
  page?: number;
  limit?: number;
  q?: string;
  role?: UserRole;
}): Promise<AdminListResult<AdminStaffRecord>> => {
  return apiClient(`/api/v1/admin/staff${qs(params)}`);
};

export const getStaffApi = (id: string): Promise<{ staff: AdminStaffRecord }> => {
  return apiClient(`/api/v1/admin/staff/${id}`);
};

export const createStaffApi = (body: {
  email: string;
  password: string;
  fullName?: string;
  mobile?: string;
  role: UserRole;
  isActive?: boolean;
}): Promise<{ staff: AdminStaffRecord }> => {
  return apiClient('/api/v1/admin/staff', { method: 'POST', body });
};

export const updateStaffApi = (
  id: string,
  body: {
    email?: string;
    password?: string;
    fullName?: string;
    mobile?: string;
    role?: UserRole;
    isActive?: boolean;
  },
): Promise<{ staff: AdminStaffRecord }> => {
  return apiClient(`/api/v1/admin/staff/${id}`, { method: 'PATCH', body });
};

export const deleteStaffApi = (id: string): Promise<Record<string, never>> => {
  return apiClient(`/api/v1/admin/staff/${id}`, { method: 'DELETE' });
};

export const listAssignableStaffApi = (): Promise<{ items: AdminUserSummary[] }> => {
  return apiClient('/api/v1/admin/staff/assignable');
};

export const listCustomersApi = (params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<AdminListResult<AdminCustomerRecord>> => {
  return apiClient(`/api/v1/admin/customers${qs(params)}`);
};

export const getCustomerApi = (id: string): Promise<{ customer: AdminCustomerRecord }> => {
  return apiClient(`/api/v1/admin/customers/${id}`);
};

export const createCustomerApi = (body: {
  email: string;
  password: string;
  fullName?: string;
  mobile?: string;
  isActive?: boolean;
}): Promise<{ customer: AdminCustomerRecord }> => {
  return apiClient('/api/v1/admin/customers', { method: 'POST', body });
};

export const updateCustomerApi = (
  id: string,
  body: {
    email?: string;
    password?: string;
    fullName?: string;
    mobile?: string;
    isActive?: boolean;
  },
): Promise<{ customer: AdminCustomerRecord }> => {
  return apiClient(`/api/v1/admin/customers/${id}`, { method: 'PATCH', body });
};

export const listSessionsApi = (params: {
  page?: number;
  limit?: number;
  audience?: 'staff' | 'customer';
}): Promise<AdminListResult<AdminAccessRecord>> => {
  return apiClient(`/api/v1/admin/sessions${qs(params)}`);
};

export const listActivityApi = (params: {
  page?: number;
  limit?: number;
}): Promise<AdminListResult<AdminActivityRecord>> => {
  return apiClient(`/api/v1/admin/activity${qs(params)}`);
};

export const listOffersApi = (params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<AdminListResult<AdminOfferPageRecord>> => {
  return apiClient(`/api/v1/admin/offers${qs(params)}`);
};

export const getOfferApi = (id: string): Promise<{ offer: AdminOfferPageRecord }> => {
  return apiClient(`/api/v1/admin/offers/${id}`);
};

export const createOfferApi = (body: {
  name: string;
  slug: string;
  offerLink?: string;
  description: string;
  imageUrl?: string;
  publishDate: string;
  status: OfferPageStatus;
  isShowPopup?: boolean;
}): Promise<{ offer: AdminOfferPageRecord }> => {
  return apiClient('/api/v1/admin/offers', { method: 'POST', body });
};

export const updateOfferApi = (
  id: string,
  body: {
    name?: string;
    slug?: string;
    offerLink?: string;
    description?: string;
    imageUrl?: string;
    publishDate?: string;
    status?: OfferPageStatus;
    isShowPopup?: boolean;
  },
): Promise<{ offer: AdminOfferPageRecord }> => {
  return apiClient(`/api/v1/admin/offers/${id}`, { method: 'PATCH', body });
};

export const listSearchRecordsApi = (params: {
  page?: number;
  limit?: number;
  userId?: string;
  from?: string;
  to?: string;
}): Promise<AdminListResult<AdminSearchRecord>> => {
  return apiClient(`/api/v1/admin/search-records${qs(params)}`);
};

export const listInquiriesApi = (params: {
  page?: number;
  limit?: number;
  assignment?: 'assigned' | 'unassigned';
}): Promise<AdminListResult<AdminInquiryRecord>> => {
  return apiClient(`/api/v1/admin/inquiries${qs(params)}`);
};

export const assignInquiryApi = (id: string): Promise<{ inquiry: AdminInquiryRecord }> => {
  return apiClient(`/api/v1/admin/inquiries/${id}/assign`, { method: 'PATCH' });
};

export const listAdminBookingsApi = (params: {
  page?: number;
  limit?: number;
  q?: string;
  status?: BookingStatus;
  assignedTo?: string;
  customerId?: string;
  from?: string;
  to?: string;
  isOnline?: boolean;
}): Promise<AdminListResult<AdminBookingRecord>> => {
  return apiClient(`/api/v1/admin/bookings${qs(params)}`);
};

export const getAdminBookingApi = (id: string): Promise<{ booking: AdminBookingRecord }> => {
  return apiClient(`/api/v1/admin/bookings/${id}`);
};

export const assignBookingApi = (id: string, assignedTo: string): Promise<{ booking: AdminBookingRecord }> => {
  return apiClient(`/api/v1/admin/bookings/${id}/assign`, { method: 'PATCH', body: { assignedTo } });
};

export const changeBookingStatusApi = (
  id: string,
  body: { status: BookingStatus; comment?: string },
): Promise<{ booking: AdminBookingRecord }> => {
  return apiClient(`/api/v1/admin/bookings/${id}/status`, { method: 'PATCH', body });
};

export const updateBookingManualApi = (
  id: string,
  body: { issuedPnr?: string; mco?: number | null; issuance?: number | null; transaction?: number | null },
): Promise<{ booking: AdminBookingRecord }> => {
  return apiClient(`/api/v1/admin/bookings/${id}/manual`, { method: 'PATCH', body });
};

export const listBookingLifecycleApi = (id: string): Promise<{ items: AdminLifecycleRecord[] }> => {
  return apiClient(`/api/v1/admin/bookings/${id}/lifecycle`);
};

export const convertBookingCustomerApi = (id: string): Promise<{ booking: AdminBookingRecord }> => {
  return apiClient(`/api/v1/admin/bookings/${id}/convert-customer`, { method: 'POST' });
};

export const listRoutesApi = (params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<AdminListResult<AdminRouteRecord>> => {
  return apiClient(`/api/v1/admin/routes${qs(params)}`);
};

export const getRouteApi = (id: string): Promise<{ route: AdminRouteRecord }> => {
  return apiClient(`/api/v1/admin/routes/${id}`);
};

export const createRouteApi = (body: {
  referenceName: string;
  origin: string;
  destination: string;
  airlines: string;
  status: RouteStatus;
}): Promise<{ route: AdminRouteRecord }> => {
  return apiClient('/api/v1/admin/routes', { method: 'POST', body });
};

export const updateRouteApi = (
  id: string,
  body: Partial<{
    referenceName: string;
    origin: string;
    destination: string;
    airlines: string;
    status: RouteStatus;
  }>,
): Promise<{ route: AdminRouteRecord }> => {
  return apiClient(`/api/v1/admin/routes/${id}`, { method: 'PATCH', body });
};

export const deleteRouteApi = (id: string): Promise<Record<string, never>> => {
  return apiClient(`/api/v1/admin/routes/${id}`, { method: 'DELETE' });
};

export const listMarkupsApi = (
  routeId: string,
  params: { page?: number; limit?: number },
): Promise<AdminListResult<AdminMarkupRecord>> => {
  return apiClient(`/api/v1/admin/routes/${routeId}/markups${qs(params)}`);
};

export const getMarkupApi = (id: string): Promise<{ markup: AdminMarkupRecord }> => {
  return apiClient(`/api/v1/admin/markups/${id}`);
};

export const createMarkupApi = (
  routeId: string,
  body: {
    inboundClasses: string;
    outboundClasses: string;
    onePx?: string;
    twoPx?: string;
    threePx?: string;
    fourPx?: string;
    fivePx?: string;
    sixPx?: string;
    sevenPx?: string;
    eightPx?: string;
    ninePx?: string;
    markupAmount: number;
    markupType: MarkupType;
    startActiveDate: string;
    endActiveDate: string;
    dta?: string;
    blackoutDates?: string[];
    status?: MarkupStatus;
  },
): Promise<{ markup: AdminMarkupRecord }> => {
  return apiClient(`/api/v1/admin/routes/${routeId}/markups`, { method: 'POST', body });
};

export const updateMarkupApi = (
  id: string,
  body: Partial<{
    inboundClasses: string;
    outboundClasses: string;
    onePx: string;
    twoPx: string;
    threePx: string;
    fourPx: string;
    fivePx: string;
    sixPx: string;
    sevenPx: string;
    eightPx: string;
    ninePx: string;
    markupAmount: number;
    markupType: MarkupType;
    startActiveDate: string;
    endActiveDate: string;
    dta: string;
    blackoutDates: string[];
    status: MarkupStatus;
  }>,
): Promise<{ markup: AdminMarkupRecord }> => {
  return apiClient(`/api/v1/admin/markups/${id}`, { method: 'PATCH', body });
};

export const deleteMarkupApi = (id: string): Promise<Record<string, never>> => {
  return apiClient(`/api/v1/admin/markups/${id}`, { method: 'DELETE' });
};
