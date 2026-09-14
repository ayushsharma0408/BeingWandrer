import { CARD_BRAND_LABELS, type AdminBookingRecord } from '@best-in-flights-booking/shared-core';
import { MdLuggage, MdPrint } from 'react-icons/md';
import { cityFor } from '@shared/lib/airport-catalog';
import { formatBagCount, formatBagWeight, formatMoney, formatShortDate } from '@shared/lib/flight-format';
import { AdminStatusBadge } from '@shared/ui/admin';
import { FlightCoupon } from './FlightCoupon';
import { FlightItinerary } from './FlightItinerary';
import { formatIssuedAt, genderLabel, passengerTypeLabel, ticketStatusCopy } from './ticket-copy';

interface AdminBookingTicketProps {
  booking: AdminBookingRecord;
}

export const AdminBookingTicket = ({ booking }: AdminBookingTicketProps): JSX.Element => {
  const copy = ticketStatusCopy(booking.status);
  const origin = booking.offer.departing.departure.iataCode;
  const destination = booking.offer.departing.arrival.iataCode;
  const locator = booking.issuedPnr || booking.pnr || booking.id.slice(-6).toUpperCase();
  const carryOn = booking.offer.baggage.carryOnBags;
  const checked = booking.offer.baggage.checkedInBags;
  const cabin = booking.offer.departing.departure.cabin?.replaceAll('_', ' ') ?? 'Economy';

  return (
    <div className="admin-ticket stack">
      <div className="admin-page-actions">
        <button type="button" className="btn btn-outline" onClick={() => window.print()}>
          <MdPrint aria-hidden /> Print ticket
        </button>
      </div>

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

          <section className="eticket-section">
            <h2>Passengers</h2>
            <table className="eticket-table">
              <thead>
                <tr>
                  <th>Traveller</th>
                  <th>Type</th>
                  <th>Date of birth</th>
                  <th>Gender</th>
                  <th>Ticket</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers.map((passenger, index) => (
                  <tr key={passenger.id}>
                    <td>
                      <strong>
                        {index + 1}. {passenger.fullName}
                      </strong>
                    </td>
                    <td>{passengerTypeLabel(passenger.passengerType)}</td>
                    <td>{passenger.dateOfBirth}</td>
                    <td>{genderLabel(passenger.gender)}</td>
                    <td>{copy.badge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="eticket-facts">
            <div className="eticket-fact">
              <p className="eticket-kicker">
                <MdLuggage className="tv-icon" aria-hidden />
                Baggage
              </p>
              <strong>
                Cabin {formatBagCount(carryOn.quantity)}
                {carryOn.weightAllowance ? ` · ${formatBagWeight(carryOn.weightAllowance, carryOn.unit)}` : ''}
              </strong>
              <p className="muted">
                Checked {formatBagCount(checked.quantity)}
                {checked.weightAllowance ? ` · ${formatBagWeight(checked.weightAllowance, checked.unit)}` : ''}
              </p>
            </div>
            <div className="eticket-fact">
              <p className="eticket-kicker">Contact</p>
              <strong className="eticket-email">{booking.contact.fullName}</strong>
              <p className="muted">{booking.contact.email}</p>
              <p className="muted">
                {booking.contact.countryCode} {booking.contact.phone}
              </p>
              <p className="muted">
                {booking.contact.address}, {booking.contact.city}, {booking.contact.state} {booking.contact.zip},{' '}
                {booking.contact.country}
              </p>
            </div>
            <div className="eticket-fact eticket-fact-fare">
              <p className="eticket-kicker">Fare</p>
              <strong>{formatMoney(booking.currency, booking.totalAmount)}</strong>
              <p className="muted">
                {booking.offer.adults} adult{booking.offer.adults === 1 ? '' : 's'}
                {booking.offer.children ? ` · ${booking.offer.children} child` : ''}
                {booking.offer.infants ? ` · ${booking.offer.infants} infant` : ''}
              </p>
              {booking.payment ? (
                <p className="muted eticket-card-mask">
                  {CARD_BRAND_LABELS[booking.payment.brand]} •••• {booking.payment.last4} · {booking.payment.holderName}
                </p>
              ) : null}
            </div>
          </section>
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
          <p className="eticket-stub-meta">Local PNR {booking.pnr ?? '—'}</p>
          {booking.issuedPnr ? <p className="eticket-stub-meta">Issued PNR {booking.issuedPnr}</p> : null}
          <p className="eticket-stub-meta">Issued {formatIssuedAt(booking.createdAt)}</p>
          <p className="eticket-stub-meta">{booking.offer.flightMode === 'Return' ? 'Round trip' : 'One way'}</p>
          <p className="eticket-stub-meta">{cabin}</p>
        </aside>
      </article>

      <section className="card stack">
        <h2>Flight itinerary</h2>
        <FlightItinerary title="Outbound" leg={booking.offer.departing} />
        {booking.offer.returning ? <FlightItinerary title="Return" leg={booking.offer.returning} /> : null}
      </section>

      <div className="admin-detail-grid">
        <section className="card stack">
          <h2>Fare breakdown</h2>
          <table className="admin-table">
            <tbody>
              <tr>
                <th>Adult base</th>
                <td>{formatMoney(booking.offer.currency, booking.offer.adultBase)}</td>
              </tr>
              <tr>
                <th>Taxes & fees</th>
                <td>{formatMoney(booking.offer.currency, booking.offer.adultTaxes)}</td>
              </tr>
              <tr>
                <th>Offer total</th>
                <td>{formatMoney(booking.offer.currency, booking.offer.grandTotal)}</td>
              </tr>
              <tr>
                <th>Refundable add-on</th>
                <td>{booking.extras?.refundable ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <th>Travel pack</th>
                <td>{booking.extras?.addPack ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <th>Amount paid</th>
                <td>
                  <strong>{formatMoney(booking.currency, booking.totalAmount)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="muted">
            Cabin {cabin} · Source {booking.offer.source} · {booking.offer.refundable ? 'Refundable fare' : 'Non-refundable fare'}
          </p>
        </section>

        <section className="card stack">
          <h2>Baggage & trip</h2>
          <p>
            <strong>Carry-on</strong>
            <br />
            {formatBagCount(carryOn.quantity)} included
            {carryOn.weightAllowance > 0 ? ` · up to ${formatBagWeight(carryOn.weightAllowance, carryOn.unit)}` : ''}
          </p>
          <p>
            <strong>Checked</strong>
            <br />
            {formatBagCount(checked.quantity)} included
            {checked.weightAllowance > 0 ? ` · up to ${formatBagWeight(checked.weightAllowance, checked.unit)}` : ''}
          </p>
          <p className="muted">Allowance is per passenger. Airline rules at the airport apply.</p>
          <p>
            Status <AdminStatusBadge value={booking.status} />
          </p>
          <p className="muted">
            Channel {booking.isOnline ? 'Online' : 'Offline'} · Offer {booking.offer.offerId}
          </p>
        </section>
      </div>
    </div>
  );
};
