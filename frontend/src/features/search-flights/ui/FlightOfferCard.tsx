import { useState } from 'react';
import { MdFlight, MdLuggage, MdWorkOutline } from 'react-icons/md';
import { Link } from 'react-router-dom';
import type { FlightLeg, FlightOffer } from '@best-in-flights-booking/shared-core';
import { cityFor } from '@shared/constants/airports';
import { formatClock, formatDuration, formatMoney, formatShortDate } from '@shared/lib/flight-format';
import { AirlineLogo } from '@shared/ui';
import { FlightDetailsModal } from './FlightOfferCard/FlightDetailsModal';

const LegRow = ({ leg }: { leg: FlightLeg }): JSX.Element => {
  return (
    <div className="tv-leg">
      <AirlineLogo code={leg.departure.carrierCode} name={leg.departure.carrierName} />
      <div className="tv-leg-end">
        <span className="muted">{formatShortDate(leg.departure.at)}</span>
        <strong>{formatClock(leg.departure.at)}</strong>
        <span>{cityFor(leg.departure.iataCode)}</span>
      </div>
      <div className="tv-path">
        <span>{formatDuration(leg.duration)}</span>
        <div className="tv-path-line">
          <MdFlight className="tv-path-plane" aria-hidden />
        </div>
        <span>{leg.numberOfStops === 0 ? 'Non-Stop' : `${leg.numberOfStops} stop`}</span>
      </div>
      <div className="tv-leg-end tv-leg-end-right">
        <span className="muted">{formatShortDate(leg.arrival.at)}</span>
        <strong>{formatClock(leg.arrival.at)}</strong>
        <span>{cityFor(leg.arrival.iataCode)}</span>
      </div>
    </div>
  );
};

interface FlightOfferCardProps {
  offer: FlightOffer;
  badges?: Array<'Low fare' | 'Best' | 'Fastest'>;
}

export const FlightOfferCard = ({ offer, badges = [] }: FlightOfferCardProps): JSX.Element => {
  const [openDeals, setOpenDeals] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const cabin = offer.departing.departure.cabin?.replaceAll('_', ' ') ?? 'Economy';

  return (
    <article className="tv-offer">
      {badges.length > 0 ? (
        <div className="tv-offer-badges">
          {badges.map((badge) => (
            <span key={badge} className={`tv-chip tv-chip-${badge === 'Low fare' ? 'green' : badge === 'Best' ? 'blue' : 'orange'}`}>
              {badge}
            </span>
          ))}
        </div>
      ) : null}
      <div className="tv-offer-body">
        <div className="tv-offer-legs">
          <LegRow leg={offer.departing} />
          {offer.returning ? <LegRow leg={offer.returning} /> : null}
          <div className="tv-bags">
            <span>
              <MdWorkOutline className="tv-icon" aria-hidden /> {offer.baggage.carryOnBags.quantity} carry-on
            </span>
            <span>
              <MdLuggage className="tv-icon" aria-hidden /> {offer.baggage.checkedInBags.quantity} checked
            </span>
          </div>
        </div>
        <div className="tv-offer-fare">
          <strong className="tv-price">{formatMoney(offer.currency, offer.grandTotal)}</strong>
          <span>Per Person</span>
          <span className="muted">{cabin}</span>
          <Link to={`/book/${offer.offerId}`} className="tv-book">
            Book
          </Link>
          <button type="button" className="tv-deals" onClick={() => setOpenDeals((value) => !value)}>
            {openDeals ? 'Hide deal' : 'View Deals (1)'}
          </button>
          <button type="button" className="link-button" onClick={() => setDetailsOpen(true)}>
            Flight Details
          </button>
        </div>
      </div>
      {openDeals ? (
        <div className="tv-deal-row">
          <span className="tv-tile-wordmark">BEST IN FLIGHTS</span>
          <span className="tv-price">{formatMoney(offer.currency, offer.grandTotal)} /Person</span>
          <Link to={`/book/${offer.offerId}`} className="tv-book">
            Book
          </Link>
        </div>
      ) : null}
      {detailsOpen ? <FlightDetailsModal offer={offer} onClose={() => setDetailsOpen(false)} /> : null}
    </article>
  );
};
