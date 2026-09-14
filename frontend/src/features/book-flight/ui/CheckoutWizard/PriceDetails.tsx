import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { addPackFeeFor, checkoutTotalFor, formatMoney, refundableFeeFor } from '../../model/fare-math';

interface PriceDetailsProps {
  offer: FlightOffer;
  extras: { refundable: boolean; addPack: boolean };
}

export const PriceDetails = ({ offer, extras }: PriceDetailsProps): JSX.Element => {
  const adultLine = offer.adultTotal * offer.adults;
  return (
    <aside className="card stack price-card">
      <h2 className="checkout-card-title">Price details</h2>
      <table className="price-table">
        <thead>
          <tr>
            <th>Travellers</th>
            <th>Per person</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Adult : {offer.adults}</td>
            <td>
              {formatMoney(offer.currency, offer.adultTotal)} × {offer.adults}
            </td>
            <td>{formatMoney(offer.currency, adultLine)}</td>
          </tr>
          {offer.children > 0 ? (
            <tr>
              <td>Child : {offer.children}</td>
              <td>—</td>
              <td>Included in fare</td>
            </tr>
          ) : null}
          {offer.infants > 0 ? (
            <tr>
              <td>Infant : {offer.infants}</td>
              <td>—</td>
              <td>Included in fare</td>
            </tr>
          ) : null}
          {extras.refundable ? (
            <tr>
              <td colSpan={2}>Refundable booking</td>
              <td>{formatMoney(offer.currency, refundableFeeFor(offer))}</td>
            </tr>
          ) : null}
          {extras.addPack ? (
            <tr>
              <td colSpan={2}>All-in-one pack</td>
              <td>{formatMoney(offer.currency, addPackFeeFor(offer))}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <div className="price-total">
        <span>Total</span>
        <strong>{formatMoney(offer.currency, checkoutTotalFor(offer, extras))}</strong>
      </div>
      <span className="badge-warn badge">Pending hold until ticketing</span>
    </aside>
  );
};
