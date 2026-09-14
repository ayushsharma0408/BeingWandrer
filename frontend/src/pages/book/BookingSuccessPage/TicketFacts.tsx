import { CARD_BRAND_LABELS, type BookingRecord } from '@best-in-flights-booking/shared-core';
import { MdCreditCard, MdLuggage, MdMailOutline, MdPayments } from 'react-icons/md';
import { formatBagCount, formatBagWeight, formatMoney } from '@shared/lib/flight-format';

interface TicketFactsProps {
  booking: BookingRecord;
}

const bagLine = (label: string, quantity: number, weight: number, unit?: string): string => {
  const pieces = `${label} ${formatBagCount(quantity)}`;
  return weight ? `${pieces} · ${formatBagWeight(weight, unit)}` : pieces;
};

export const TicketFacts = ({ booking }: TicketFactsProps): JSX.Element => {
  const carryOn = booking.offer.baggage.carryOnBags;
  const checked = booking.offer.baggage.checkedInBags;
  const fareNote = booking.status === 'PENDING' ? 'Payment recorded. Ticket not issued yet.' : booking.status;

  return (
    <section className="eticket-facts">
      <div className="eticket-fact">
        <p className="eticket-kicker">
          <MdLuggage className="tv-icon" aria-hidden />
          Baggage
        </p>
        <strong>{bagLine('Cabin', carryOn.quantity, carryOn.weightAllowance, carryOn.unit)}</strong>
        <p className="muted">{bagLine('Checked', checked.quantity, checked.weightAllowance, checked.unit)}</p>
      </div>
      <div className="eticket-fact">
        <p className="eticket-kicker">
          <MdMailOutline className="tv-icon" aria-hidden />
          Contact
        </p>
        <strong className="eticket-email">{booking.contact.email}</strong>
        <p className="muted">
          {booking.contact.countryCode ? `${booking.contact.countryCode} ` : ''}
          {booking.contact.phone}
        </p>
      </div>
      <div className="eticket-fact eticket-fact-fare">
        <p className="eticket-kicker">
          <MdPayments className="tv-icon" aria-hidden />
          Fare
        </p>
        <strong>{formatMoney(booking.currency, booking.totalAmount)}</strong>
        <p className="muted">{fareNote}</p>
        {booking.payment ? (
          <p className="muted eticket-card-mask">
            <MdCreditCard className="tv-icon" aria-hidden />
            {CARD_BRAND_LABELS[booking.payment.brand]} •••• {booking.payment.last4}
          </p>
        ) : null}
      </div>
    </section>
  );
};
