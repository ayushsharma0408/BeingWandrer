import type { FlightLeg, FlightOffer } from '@best-in-flights-booking/shared-core';
import { AirlineLogo } from '@shared/ui';
import { formatClock, formatDate } from '../../model/fare-math';

const LegBlock = ({ title, leg }: { title: string; leg: FlightLeg }): JSX.Element => {
  return (
    <div className="flight-summary-leg">
      <div className="flight-summary-head">
        <strong>{title}</strong>
        <span className="muted">
          <AirlineLogo className="tv-airline-logo-sm" code={leg.departure.carrierCode} name={leg.departure.carrierName} />{' '}
          {leg.departure.carrierName}
        </span>
      </div>
      <p className="muted" style={{ margin: 0 }}>
        {formatDate(leg.departure.at)} · {leg.flightNumber}
      </p>
      <div className="offer-times">
        <div>
          <div className="offer-time">{formatClock(leg.departure.at)}</div>
          <div className="muted">{leg.departure.iataCode}</div>
        </div>
        <div className="offer-line">
          <span>
            {leg.duration} · {leg.numberOfStops === 0 ? 'Direct' : `${leg.numberOfStops} stop`}
          </span>
        </div>
        <div>
          <div className="offer-time">{formatClock(leg.arrival.at)}</div>
          <div className="muted">{leg.arrival.iataCode}</div>
        </div>
      </div>
    </div>
  );
};

interface FlightSummaryProps {
  offer: FlightOffer;
}

export const FlightSummary = ({ offer }: FlightSummaryProps): JSX.Element => {
  return (
    <section className="card stack">
      <h2 className="checkout-card-title">Itinerary</h2>
      <LegBlock title="Departure" leg={offer.departing} />
      {offer.returning ? <LegBlock title="Return" leg={offer.returning} /> : null}
      <p className="muted" style={{ margin: 0 }}>
        Baggage {offer.baggage.checkedInBags.quantity} checked · {offer.baggage.carryOnBags.quantity} cabin
      </p>
    </section>
  );
};
