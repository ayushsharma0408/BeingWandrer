import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { Link } from 'react-router-dom';
import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { cityFor } from '@shared/constants/airports';
import { BaggagePanel } from './FlightDetailsModal/BaggagePanel';
import { PriceBreakdown } from './FlightDetailsModal/PriceBreakdown';
import { Timeline } from './FlightDetailsModal/Timeline';

interface FlightDetailsModalProps {
  offer: FlightOffer;
  onClose: () => void;
}

type Tab = 'details' | 'price' | 'bags';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'details', label: 'Flight Details' },
  { id: 'price', label: 'Price Breakdown' },
  { id: 'bags', label: 'Baggage Information' },
];

export const FlightDetailsModal = ({ offer, onClose }: FlightDetailsModalProps): JSX.Element => {
  const [tab, setTab] = useState<Tab>('details');

  return (
    <div className="modal-backdrop tv-details-backdrop" role="presentation" onClick={onClose}>
      <div
        className="tv-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flight-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="tv-details-top">
          <div className="tv-detail-tabs" role="tablist" aria-label="Flight detail sections">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={tab === item.id ? 'is-active' : ''}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" className="modal-close tv-details-close" onClick={onClose} aria-label="Close">
            <MdClose aria-hidden />
          </button>
        </div>
        <h2 id="flight-details-title" className="sr-only">
          {cityFor(offer.departing.departure.iataCode)} to {cityFor(offer.departing.arrival.iataCode)} flight details
        </h2>
        <div className="tv-details-body">
          {tab === 'details' ? (
            <>
              <Timeline
                title={`${cityFor(offer.departing.departure.iataCode)} to ${cityFor(offer.departing.arrival.iataCode)}`}
                leg={offer.departing}
              />
              {offer.returning ? (
                <Timeline
                  title={`${cityFor(offer.returning.departure.iataCode)} to ${cityFor(offer.returning.arrival.iataCode)}`}
                  leg={offer.returning}
                />
              ) : null}
            </>
          ) : null}
          {tab === 'price' ? <PriceBreakdown offer={offer} /> : null}
          {tab === 'bags' ? (
            <BaggagePanel carryOn={offer.baggage.carryOnBags} checked={offer.baggage.checkedInBags} />
          ) : null}
        </div>
        <div className="tv-details-foot">
          <Link to={`/book/${offer.offerId}`} className="tv-book">
            Book this fare
          </Link>
        </div>
      </div>
    </div>
  );
};
