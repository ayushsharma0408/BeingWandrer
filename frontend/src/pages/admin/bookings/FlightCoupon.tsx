import type { FlightLeg } from '@best-in-flights-booking/shared-core';
import { MdFlight } from 'react-icons/md';
import { cityFor } from '@shared/lib/airport-catalog';
import { formatClock, formatDuration, formatShortDate, terminalLabel } from '@shared/lib/flight-format';
import { AirlineLogo } from '@shared/ui';

interface FlightCouponProps {
  title: string;
  leg: FlightLeg;
}

export const FlightCoupon = ({ title, leg }: FlightCouponProps): JSX.Element => {
  const cabin = leg.departure.cabin?.replaceAll('_', ' ') ?? 'Economy';
  const viaAirports = (leg.segments ?? []).slice(0, -1).map((segment) => segment.arrival.iataCode);
  const stops =
    leg.numberOfStops === 0
      ? 'Non-stop'
      : viaAirports.length > 0
        ? `via ${viaAirports.join(', ')}`
        : `${leg.numberOfStops} stop${leg.numberOfStops > 1 ? 's' : ''}`;
  const departureTerminal = terminalLabel(leg.departure.terminal);
  const arrivalTerminal = terminalLabel(leg.arrival.terminal);

  return (
    <article className="eticket-coupon">
      <div className="eticket-coupon-head">
        <span className="eticket-kicker">{title}</span>
        <span>{formatShortDate(leg.departure.at)}</span>
      </div>
      <div className="eticket-airline">
        <AirlineLogo code={leg.departure.carrierCode} name={leg.departure.carrierName} />
        <div>
          <strong>
            {leg.departure.carrierName} {leg.flightNumber}
          </strong>
          <p className="muted">
            {cabin}
            {leg.departure.aircraftName ? ` · ${leg.departure.aircraftName}` : ''}
          </p>
        </div>
      </div>
      <div className="eticket-times">
        <div>
          <strong>{formatClock(leg.departure.at)}</strong>
          <span className="eticket-iata">{leg.departure.iataCode}</span>
          <span>{cityFor(leg.departure.iataCode)}</span>
          <span className="muted">{leg.departure.airportName}</span>
          {departureTerminal ? <span className="muted">Terminal {departureTerminal}</span> : null}
        </div>
        <div className="eticket-path">
          <span>{formatDuration(leg.duration)}</span>
          <div className="eticket-path-line">
            <MdFlight className="eticket-path-plane" aria-hidden />
          </div>
          <span>{stops}</span>
        </div>
        <div className="eticket-times-end">
          <strong>{formatClock(leg.arrival.at)}</strong>
          <span className="eticket-iata">{leg.arrival.iataCode}</span>
          <span>{cityFor(leg.arrival.iataCode)}</span>
          <span className="muted">{leg.arrival.airportName}</span>
          {arrivalTerminal ? <span className="muted">Terminal {arrivalTerminal}</span> : null}
        </div>
      </div>
    </article>
  );
};
