import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import type { BookingStatus } from '@best-in-flights-booking/shared-core';
import {
  assignBookingApi,
  changeBookingStatusApi,
  convertBookingCustomerApi,
  getAdminBookingApi,
  listAssignableStaffApi,
  listBookingLifecycleApi,
} from '@entities/admin';
import { ApiClientError } from '@shared/api';
import { formatDateTime } from '@shared/lib/datetime';
import { AdminModal, AdminPageHeader, AdminRefreshButton, AdminStatusBadge } from '@shared/ui/admin';
import { AdminBookingTicket } from './AdminBookingTicket';
import { BOOKING_STATUS_OPTIONS } from './booking-status';

export const AdminBookingDetailPage = (): JSX.Element => {
  const { id = '' } = useParams();
  const client = useQueryClient();
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [assignee, setAssignee] = useState('');
  const [ticketOpen, setTicketOpen] = useState(false);

  const bookingQuery = useQuery({
    queryKey: ['admin-booking', id],
    queryFn: () => getAdminBookingApi(id),
    enabled: Boolean(id),
  });
  const lifecycleQuery = useQuery({
    queryKey: ['admin-booking-lifecycle', id],
    queryFn: () => listBookingLifecycleApi(id),
    enabled: Boolean(id),
  });
  const staffQuery = useQuery({ queryKey: ['admin-assignable-staff'], queryFn: listAssignableStaffApi });
  const booking = bookingQuery.data?.booking;

  const invalidate = async (): Promise<void> => {
    await client.invalidateQueries({ queryKey: ['admin-booking', id] });
    await client.invalidateQueries({ queryKey: ['admin-booking-lifecycle', id] });
    await client.invalidateQueries({ queryKey: ['admin-bookings'] });
  };

  const assign = useMutation({
    mutationFn: () => assignBookingApi(id, assignee),
    onSuccess: () => void invalidate(),
  });
  const changeStatus = useMutation({
    mutationFn: () => changeBookingStatusApi(id, { status: status as BookingStatus, ...(comment ? { comment } : {}) }),
    onSuccess: () => {
      setComment('');
      void invalidate();
    },
  });
  const convert = useMutation({
    mutationFn: () => convertBookingCustomerApi(id),
    onSuccess: () => void invalidate(),
  });

  if (bookingQuery.isLoading) {
    return <p className="muted">Loading booking…</p>;
  }
  if (!booking) {
    return <p className="field-error">Booking not found.</p>;
  }

  const actionError =
    assign.error instanceof ApiClientError
      ? assign.error.message
      : changeStatus.error instanceof ApiClientError
        ? changeStatus.error.message
        : convert.error instanceof ApiClientError
          ? convert.error.message
          : null;

  return (
    <div className="stack admin-booking-detail">
      <AdminPageHeader
        title={`Booking ${booking.pnr ?? booking.id.slice(-6)}`}
        subtitle={`${booking.offer.departing.departure.iataCode} → ${booking.offer.departing.arrival.iataCode}`}
        actions={
          <>
            <AdminRefreshButton
              onRefresh={() => {
                void bookingQuery.refetch();
                void lifecycleQuery.refetch();
                void staffQuery.refetch();
              }}
              isRefreshing={bookingQuery.isRefetching || lifecycleQuery.isRefetching}
            />
            <button type="button" className="btn btn-outline" onClick={() => setTicketOpen(true)}>
              View full ticket
            </button>
            <Link to="/admin/bookings" className="btn btn-ghost">
              Back to list
            </Link>
          </>
        }
      />

      <section className="card admin-booking-actions">
        <div className="admin-booking-actions-status">
          <AdminStatusBadge value={booking.status} />
          <span className="muted">
            {booking.assignedTo?.fullName ?? booking.assignedTo?.email ?? 'Unassigned'}
          </span>
        </div>
        <div className="admin-booking-actions-row">
          <label className="field admin-booking-field">
            <span className="field-label">Assign to</span>
            <select className="input" value={assignee} onChange={(event) => setAssignee(event.target.value)}>
              <option value="">Select staff</option>
              {staffQuery.data?.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName ?? item.email}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn-outline" disabled={!assignee || assign.isPending} onClick={() => assign.mutate()}>
            {assign.isPending ? 'Assigning…' : 'Assign'}
          </button>
          <label className="field admin-booking-field">
            <span className="field-label">Status</span>
            <select className="input" value={status} onChange={(event) => setStatus(event.target.value as BookingStatus)}>
              <option value="">Select status</option>
              {BOOKING_STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="field admin-booking-field admin-booking-field-grow">
            <span className="field-label">Comment</span>
            <input
              className="input"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Optional note"
            />
          </label>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!status || changeStatus.isPending}
            onClick={() => changeStatus.mutate()}
          >
            {changeStatus.isPending ? 'Updating…' : 'Update status'}
          </button>
        </div>
        {actionError ? <p className="field-error">{actionError}</p> : null}
      </section>

      <div className="admin-ops stack">
        <div className="admin-detail-grid admin-detail-grid-3">
          <section className="card stack admin-compact-card">
            <h2>Customer</h2>
            <p>
              <strong>{booking.contact.fullName}</strong>
              <br />
              {booking.contact.email}
              <br />
              {booking.contact.phone}
            </p>
            <p className="muted admin-compact-line">
              {booking.contact.address}, {booking.contact.city}, {booking.contact.state} {booking.contact.zip}
            </p>
            {booking.isGuest ? (
              <button type="button" className="btn btn-outline" disabled={convert.isPending} onClick={() => convert.mutate()}>
                Convert to customer
              </button>
            ) : (
              <p className="muted">Linked customer account</p>
            )}
          </section>

          <section className="card stack admin-compact-card">
            <h2>Payment</h2>
            {booking.payment ? (
              <p>
                {booking.payment.brand} •••• {booking.payment.last4}
                <br />
                {booking.payment.holderName}
                <br />
                Exp {booking.payment.expMonth}/{booking.payment.expYear}
              </p>
            ) : (
              <p className="muted">No card summary stored.</p>
            )}
            <p>
              <strong>
                {booking.currency} {booking.totalAmount.toLocaleString()}
              </strong>
            </p>
          </section>

          <section className="card stack admin-compact-card">
            <h2>Ticket details</h2>
            <p className="admin-compact-line">Local PNR: {booking.pnr ?? '—'}</p>
            <p className="admin-compact-line">Issued PNR: {booking.issuedPnr ?? '—'}</p>
            <p className="admin-compact-line">MCO: {booking.mco ?? '—'}</p>
            <p className="admin-compact-line">Issuance: {booking.issuance ?? '—'}</p>
            <p className="admin-compact-line">Transaction: {booking.transaction ?? '—'}</p>
            <p className="admin-compact-line">Channel: {booking.isOnline ? 'Online' : 'Offline'}</p>
          </section>
        </div>

        <section className="card stack admin-lifecycle">
          <h2>Status lifecycle</h2>
          <div className="admin-table-wrap admin-lifecycle-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Event</th>
                  <th>By</th>
                  <th>On</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {lifecycleQuery.data?.items.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td>{row.lifeCycle}</td>
                    <td>{row.actionBy?.fullName ?? row.actionBy?.email ?? '—'}</td>
                    <td>{row.actionOn?.fullName ?? row.actionOn?.email ?? '—'}</td>
                    <td>{row.comment ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {ticketOpen ? (
        <AdminModal title="Full ticket" size="wide" onClose={() => setTicketOpen(false)}>
          <AdminBookingTicket booking={booking} />
        </AdminModal>
      ) : null}
    </div>
  );
};
