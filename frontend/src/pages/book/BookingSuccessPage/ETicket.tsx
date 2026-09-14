import type { BookingRecord } from '@best-in-flights-booking/shared-core';
import { cityFor } from '@shared/constants/airports';
import { formatShortDate } from '@shared/lib/flight-format';
import { FlightCoupon } from './FlightCoupon';
import { TicketFacts } from './TicketFacts';
import { TicketPassengers } from './TicketPassengers';
import { formatIssuedAt, ticketStatusCopy } from './ticket-copy';

interface ETicketProps {
  booking: BookingRecord;
}

export const ETicket = ({ booking }: ETicketProps): JSX.Element => {
  const copy = ticketStatusCopy(booking.status);
  const origin = booking.offer.departing.departure.iataCode;
  const destination = booking.offer.departing.arrival.iataCode;
  const locator = booking.pnr ?? booking.id.slice(-6).toUpperCase();

  return (
    <article className="eticket">
      <div className="eticket-main">
        <header className="eticket-banner">
          <div>
            <p className="eticket-kicker">Electronic ticket</p>
            <h1>{copy.headline}</h1>
            <p className="muted">{copy.detail}</p>
          </div>
          <span className={`eticket-status eticket-status-${copy.tone}`}>{copy.badge}</span>
        </header>

        <FlightCoupon title="Outbound" leg={booking.offer.departing} />
        {booking.offer.returning ? <FlightCoupon title="Return" leg={booking.offer.returning} /> : null}

        <TicketPassengers passengers={booking.passengers} ticketStatus={copy.badge} />
        <TicketFacts booking={booking} />

        {booking.isGuest ? (
          <p className="eticket-note muted">Guest checkout — sign in next time if you want this trip saved under an account.</p>
        ) : null}
        <p className="eticket-note muted">
          This is an itinerary receipt, not a boarding pass. Present a valid photo ID at the airport with locator {locator}.
        </p>
      </div>

      <aside className="eticket-stub">
        <p className="eticket-kicker">Airline locator</p>
        <p className="eticket-pnr">{locator}</p>
        <div className="eticket-barcode" aria-hidden="true" />
        <p className="eticket-stub-route">
          {origin} → {destination}
        </p>
        <p>
          {cityFor(origin)} – {cityFor(destination)}
        </p>
        <p>{formatShortDate(booking.offer.departing.departure.at)}</p>
        <p className="eticket-stub-meta">Issued {formatIssuedAt(booking.createdAt)}</p>
        <p className="eticket-stub-meta">{booking.offer.flightMode === 'Return' ? 'Round trip' : 'One way'}</p>
      </aside>
    </article>
  );
};
