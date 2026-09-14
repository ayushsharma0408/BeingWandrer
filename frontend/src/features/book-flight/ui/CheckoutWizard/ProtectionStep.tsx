import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { addPackFeeFor, formatMoney, refundableFeeFor } from '../../model/fare-math';
import type { BookingFormValues } from '../../model/booking-schema';

interface ProtectionStepProps {
  offer: FlightOffer;
  register: UseFormRegister<BookingFormValues>;
  watch: UseFormWatch<BookingFormValues>;
  setValue: UseFormSetValue<BookingFormValues>;
}

export const ProtectionStep = ({ offer, register, watch, setValue }: ProtectionStepProps): JSX.Element => {
  const extras = watch('extras');
  return (
    <div className="stack">
      <section className="card stack">
        <div className="protection-head">
          <h1 className="checkout-card-title">Refundable booking</h1>
          <span className="badge">Recommended</span>
        </div>
        <p className="protection-banner">
          Add a refundable booking on top of {formatMoney(offer.currency, offer.grandTotal)} so you can recover the fare
          for illness, weather, or a missed connection.
        </p>
        <ul className="muted">
          <li>Flight refund of the base fare</li>
          <li>Illness, injury, or a pre-existing condition</li>
          <li>Adverse weather and public-transport failure</li>
          <li>Mechanical breakdown of a private vehicle</li>
        </ul>
        <div className="choice-grid">
          <button
            type="button"
            className={`choice-box ${extras.refundable ? 'is-selected' : ''}`}
            onClick={() => setValue('extras.refundable', true)}
          >
            <strong>Yes</strong>, make my booking refundable (+{formatMoney(offer.currency, refundableFeeFor(offer))})
          </button>
          <button
            type="button"
            className={`choice-box ${!extras.refundable ? 'is-selected' : ''}`}
            onClick={() => setValue('extras.refundable', false)}
          >
            <strong>No</strong>, continue with a non-refundable fare
          </button>
        </div>
      </section>
      <section className="card stack">
        <h2 className="checkout-card-title">All-in-one pack</h2>
        <p className="muted">
          Seat help, 24×7 concierge, and missed-connection assistance for every adult and child on this ticket.
        </p>
        <label className="choice-box">
          <input type="checkbox" {...register('extras.addPack')} />
          <span>
            Add the pack for {formatMoney(offer.currency, addPackFeeFor(offer))} ({offer.adults + offer.children} traveller
            {offer.adults + offer.children === 1 ? '' : 's'})
          </span>
        </label>
      </section>
    </div>
  );
};
