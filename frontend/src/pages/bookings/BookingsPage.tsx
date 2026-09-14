import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listBookingsApi } from '@entities/booking';
import { ApiClientError } from '@shared/api';

export const BookingsPage = (): JSX.Element => {
  const query = useQuery({
    queryKey: ['bookings'],
    queryFn: listBookingsApi,
  });

  return (
    <div className="page-shell">
      <div className="wrap stack">
        <h1 className="section-title">My trips</h1>
        {query.isLoading ? <div className="skeleton" /> : null}
        {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
        {query.data?.length === 0 ? <p className="muted">No trips yet. Search a route and book your first fare.</p> : null}
        {query.data?.map((booking) => (
          <Link key={booking.id} to={`/bookings/${booking.id}`} className="card ticket-card">
            <div>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {booking.offer.departing.departure.iataCode} → {booking.offer.departing.arrival.iataCode}
              </p>
              <p className="muted">
                {booking.offer.departing.departure.carrierName} {booking.offer.departing.flightNumber}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge">{booking.status}</span>
              <p>
                {booking.currency} {Math.round(booking.totalAmount).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
