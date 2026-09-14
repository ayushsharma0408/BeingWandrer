import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { cancelBookingApi, getBookingApi } from '@entities/booking';
import { ApiClientError } from '@shared/api';
import { Button } from '@shared/ui';

export const BookingDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingApi(id ?? ''),
    enabled: Boolean(id),
  });
  const cancel = useMutation({
    mutationFn: () => cancelBookingApi(id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['booking', id] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  if (query.isLoading) {
    return (
      <div className="page-shell">
        <div className="wrap">
          <div className="skeleton" />
        </div>
      </div>
    );
  }

  if (query.error instanceof ApiClientError || !query.data) {
    return (
      <div className="page-shell">
        <div className="wrap">
          <p className="field-error">{query.error instanceof ApiClientError ? query.error.message : 'Booking not found'}</p>
        </div>
      </div>
    );
  }

  const { booking } = query.data;

  return (
    <div className="page-shell">
      <div className="wrap checkout-grid">
        <section className="card stack">
          <span className="badge">{booking.status}</span>
          <h1 className="section-title">
            {booking.offer.departing.departure.iataCode} → {booking.offer.departing.arrival.iataCode}
          </h1>
          <p className="muted">
            {booking.offer.departing.departure.carrierName} {booking.offer.departing.flightNumber}
            {booking.pnr ? ` · PNR ${booking.pnr}` : ''}
          </p>
          <h3>Passengers</h3>
          <ul className="stack">
            {booking.passengers.map((passenger) => (
              <li key={passenger.id}>
                {passenger.fullName} · {passenger.passengerType}
              </li>
            ))}
          </ul>
        </section>
        <aside className="card stack">
          <h2>Amount</h2>
          <strong style={{ fontSize: '1.6rem' }}>
            {booking.currency} {Math.round(booking.totalAmount).toLocaleString()}
          </strong>
          {booking.status !== 'CANCELLED' ? (
            <Button type="button" variant="outline" disabled={cancel.isPending} onClick={() => void cancel.mutate()}>
              {cancel.isPending ? 'Cancelling…' : 'Cancel trip'}
            </Button>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
