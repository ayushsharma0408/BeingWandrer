import { Link, useLocation } from 'react-router-dom';
import type { BookingRecord } from '@best-in-flights-booking/shared-core';
import { Button } from '@shared/ui';
import { ETicket } from './BookingSuccessPage/ETicket';
import { TicketActions } from './BookingSuccessPage/TicketActions';

export const BookingSuccessPage = (): JSX.Element => {
  const location = useLocation();
  const booking = (location.state as { booking?: BookingRecord } | null)?.booking;

  if (!booking) {
    return (
      <div className="page-shell">
        <div className="wrap ticket-page">
          <div className="eticket-empty">
            <h1>No ticket to show</h1>
            <p className="muted">This confirmation is only available right after checkout. Search again or sign in to open saved trips.</p>
            <Link to="/">
              <Button type="button">Search flights</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="wrap ticket-page">
        <ETicket booking={booking} />
        <TicketActions bookingId={booking.id} isGuest={booking.isGuest} />
      </div>
    </div>
  );
};
