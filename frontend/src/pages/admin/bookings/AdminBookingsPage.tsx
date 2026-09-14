import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import type { BookingStatus } from '@best-in-flights-booking/shared-core';
import { listAdminBookingsApi, listAssignableStaffApi } from '@entities/admin';
import { formatDateTime } from '@shared/lib/datetime';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminResetFiltersButton, AdminStatusBadge } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';
import { BOOKING_STATUS_TABS } from './booking-status';

export const AdminBookingsPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const page = Number(params.get('page') ?? '1');
  const status = (params.get('status') ?? '') as BookingStatus | '';
  const assignedTo = params.get('assignedTo') ?? '';
  const customerId = params.get('customerId') ?? '';
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const hasFilters = Boolean(status || assignedTo || customerId || from || to || params.get('q'));

  const staff = useQuery({ queryKey: ['admin-assignable-staff'], queryFn: listAssignableStaffApi });
  const query = useQuery({
    queryKey: ['admin-bookings', page, status, assignedTo, customerId, from, to, params.get('q')],
    queryFn: () =>
      listAdminBookingsApi({
        page,
        limit: 20,
        ...(status ? { status } : {}),
        ...(assignedTo ? { assignedTo } : {}),
        ...(customerId ? { customerId } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(params.get('q') ? { q: params.get('q') ?? undefined } : {}),
      }),
  });

  const setFilter = (key: string, value: string): void => {
    const next = new URLSearchParams(params);
    next.set('page', '1');
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const resetFilters = (): void => {
    setSearch('');
    setParams({});
  };

  return (
    <div className="stack">
      <AdminPageHeader
        title="Bookings"
        subtitle="Full lifecycle from unassigned hold through ticketed or cancelled."
        actions={<AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />}
      />
      <div className="admin-tabs">
        {BOOKING_STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={status === tab.value ? 'admin-tab is-active' : 'admin-tab'}
            onClick={() => setFilter('status', tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <form
        className="admin-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setFilter('q', search);
        }}
      >
        <div className="admin-search">
          <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="PNR, name, email, phone" />
          <select className="input" value={assignedTo} onChange={(event) => setFilter('assignedTo', event.target.value)}>
            <option value="">All staff</option>
            {staff.data?.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName ?? item.email}
              </option>
            ))}
          </select>
          <input className="input" type="date" value={from} onChange={(event) => setFilter('from', event.target.value)} />
          <input className="input" type="date" value={to} onChange={(event) => setFilter('to', event.target.value)} />
          <button type="submit" className="btn btn-outline">
            Search
          </button>
          <AdminResetFiltersButton onReset={resetFilters} disabled={!hasFilters} />
        </div>
      </form>
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>PNR</th>
              <th>Issued PNR</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Travel</th>
              <th>Pax</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>MCO</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link to={`/admin/bookings/${row.id}`}>{row.pnr ?? row.id.slice(-6)}</Link>
                </td>
                <td>{row.issuedPnr ?? '—'}</td>
                <td>
                  {row.contact.fullName}
                  <small className="muted">{row.contact.email}</small>
                </td>
                <td>
                  {row.offer.departing.departure.iataCode} → {row.offer.departing.arrival.iataCode}
                </td>
                <td>{row.offer.departing.departure.at.slice(0, 10)}</td>
                <td>
                  {row.offer.adults}/{row.offer.children}/{row.offer.infants}
                </td>
                <td>
                  <AdminStatusBadge value={row.status} />
                </td>
                <td>{row.assignedTo?.fullName ?? row.assignedTo?.email ?? '—'}</td>
                <td>{row.mco ?? '—'}</td>
                <td>{formatDateTime(row.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No bookings in this queue." /> : null}
      </div>
      {query.data ? (
        <AdminPager
          page={query.data.page}
          totalPages={query.data.totalPages}
          total={query.data.total}
          onPageChange={(nextPage) => {
            const next = new URLSearchParams(params);
            next.set('page', String(nextPage));
            setParams(next);
          }}
        />
      ) : null}
    </div>
  );
};
