import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { Button } from '@shared/ui';
import { useAppSelector } from '@shared/store';
import { bookingFormSchema, type BookingFormValues } from '../model/booking-schema';
import { checkoutTotalFor, formatMoney } from '../model/fare-math';
import { useCreateBooking } from '../model/use-create-booking';
import { BillingStep } from './CheckoutWizard/BillingStep';
import { CheckoutStepper } from './CheckoutWizard/CheckoutStepper';
import { FlightSummary } from './CheckoutWizard/FlightSummary';
import { PriceDetails } from './CheckoutWizard/PriceDetails';
import { ProtectionStep } from './CheckoutWizard/ProtectionStep';
import { TravellerStep } from './CheckoutWizard/TravellerStep';

interface CheckoutWizardProps {
  offer: FlightOffer;
  onOpenAuth: () => void;
}

const buildPassengers = (offer: FlightOffer): BookingFormValues['passengers'] => {
  const adults = Array.from({ length: offer.adults }, () => ({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: undefined as unknown as 'MALE',
    passengerType: 'ADULT' as const,
  }));
  const children = Array.from({ length: offer.children }, () => ({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: undefined as unknown as 'MALE',
    passengerType: 'CHILD' as const,
  }));
  const infants = Array.from({ length: offer.infants }, () => ({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: undefined as unknown as 'MALE',
    passengerType: 'INFANT' as const,
  }));
  return [...adults, ...children, ...infants];
};

export const CheckoutWizard = ({ offer, onOpenAuth }: CheckoutWizardProps): JSX.Element => {
  const user = useAppSelector((state) => state.user.current);
  const { submit, isSubmitting, formError } = useCreateBooking();
  const [step, setStep] = useState(0);
  const {
    control,
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      passengers: buildPassengers(offer),
      extras: { refundable: false, addPack: false },
      contact: {
        fullName: user?.fullName ?? '',
        email: user?.email ?? '',
        phone: '',
        country: 'India',
        countryCode: '+91',
        city: '',
        state: '',
        address: '',
        zip: '',
      },
      card: {
        brand: undefined as unknown as BookingFormValues['card']['brand'],
        holderName: '',
        number: '',
        expDate: '',
        cvv: '',
      },
      acceptedTerms: false,
    },
  });
  const { fields } = useFieldArray({ control, name: 'passengers' });
  const extras = watch('extras');

  const goNext = async (): Promise<void> => {
    if (step === 0) {
      const ok = await trigger('passengers');
      if (!ok) {
        return;
      }
    }
    setStep((current) => Math.min(current + 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <form className="stack" onSubmit={handleSubmit((values) => submit(offer.offerId, values))} noValidate>
        <CheckoutStepper step={step} />
        <div className="checkout-grid">
          <div className="stack">
            {step === 0 ? (
              <TravellerStep offer={offer} fields={fields} register={register} errors={errors} />
            ) : null}
            {step === 1 ? (
              <ProtectionStep offer={offer} register={register} watch={watch} setValue={setValue} />
            ) : null}
            {step === 2 ? (
              <BillingStep register={register} watch={watch} setValue={setValue} errors={errors} onOpenAuth={onOpenAuth} />
            ) : null}
            {formError ? <p className="field-error">{formError}</p> : null}
            <div className="checkout-actions">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}>
                  Back
                </Button>
              ) : null}
              {step < 2 ? (
                <Button type="button" onClick={() => void goNext()}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Confirming…' : `Confirm · ${formatMoney(offer.currency, checkoutTotalFor(offer, extras))}`}
                </Button>
              )}
            </div>
          </div>
          <div className="stack">
            <FlightSummary offer={offer} />
            <PriceDetails offer={offer} extras={extras} />
          </div>
        </div>
      </form>
  );
};
