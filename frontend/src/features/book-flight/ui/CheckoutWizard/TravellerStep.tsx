import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import type { BookingFormValues } from '../../model/booking-schema';
import { PassengerFields } from '../PassengerForm/PassengerFields';

interface TravellerStepProps {
  offer: FlightOffer;
  fields: Array<{ id: string; passengerType: BookingFormValues['passengers'][number]['passengerType'] }>;
  register: UseFormRegister<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

export const TravellerStep = ({ offer, fields, register, errors }: TravellerStepProps): JSX.Element => {
  return (
    <section className="card stack">
      <h1 className="checkout-card-title">Traveller details</h1>
      <p className="muted">
        Names must match the passport or government ID used at the airport. {offer.adults} adult
        {offer.adults === 1 ? '' : 's'}
        {offer.children ? ` · ${offer.children} child` : ''}
        {offer.infants ? ` · ${offer.infants} infant` : ''}.
      </p>
      {fields.map((field, index) => (
        <PassengerFields
          key={field.id}
          index={index}
          passengerType={field.passengerType}
          register={register}
          errors={errors}
        />
      ))}
    </section>
  );
};
