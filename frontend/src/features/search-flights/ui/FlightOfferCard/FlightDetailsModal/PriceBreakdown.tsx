import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { formatMoney } from '@shared/lib/flight-format';

export const PriceBreakdown = ({ offer }: { offer: FlightOffer }): JSX.Element => {
  const adults = Math.max(offer.adults, 1);
  return (
    <div className="tv-detail-panel">
      <table className="tv-price-rows">
        <tbody>
          <tr>
            <th>Adult fare{adults > 1 ? ` · ${adults} travellers` : ''}</th>
            <td>{formatMoney(offer.currency, offer.adultBase)}</td>
          </tr>
          <tr>
            <th>Taxes & fees</th>
            <td>{formatMoney(offer.currency, offer.adultTaxes)}</td>
          </tr>
          {offer.children > 0 ? (
            <tr>
              <th>Child</th>
              <td>{offer.children} included in fare</td>
            </tr>
          ) : null}
          {offer.infants > 0 ? (
            <tr>
              <th>Infant</th>
              <td>{offer.infants} included in fare</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <div className="tv-price-total">
        <span>Total</span>
        <strong>{formatMoney(offer.currency, offer.grandTotal)}</strong>
      </div>
      <p className="muted">Per person · {offer.departing.departure.cabin?.replaceAll('_', ' ') ?? 'Economy'}</p>
    </div>
  );
};
