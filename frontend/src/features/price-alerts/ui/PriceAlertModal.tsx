import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { FlightMode } from '@best-in-flights-booking/shared-core';
import { cityFor } from '@shared/constants/airports';
import { formatMoney, formatShortDate } from '@shared/lib/flight-format';
import { useAppSelector } from '@shared/store';
import { Button } from '@shared/ui';
import { priceAlertSchema, type PriceAlertFormValues } from '../model/alert-schema';
import { useCreatePriceAlert } from '../model/use-create-price-alert';
import { AlertFormFields } from './PriceAlertModal/AlertFormFields';
import { AlertSubmitButton } from './PriceAlertModal/AlertSubmitButton';

export interface PriceAlertRoute {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  flightMode: FlightMode;
  currency: string;
  currentPrice: number;
}

interface PriceAlertModalProps {
  route: PriceAlertRoute;
  onClose: () => void;
  onSaved: () => void;
}

export const PriceAlertModal = ({ route, onClose, onSaved }: PriceAlertModalProps): JSX.Element => {
  const user = useAppSelector((state) => state.user.current);
  const { submit, isSubmitting, formError, isSuccess } = useCreatePriceAlert();
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<PriceAlertFormValues>({
    resolver: zodResolver(priceAlertSchema),
    defaultValues: { email: user?.email ?? '' },
  });

  useEffect(() => {
    resetForm({ email: user?.email ?? '' });
  }, [resetForm, user?.email]);

  const onSubmit = async (values: PriceAlertFormValues): Promise<void> => {
    try {
      await submit(values, {
        origin: route.origin,
        destination: route.destination,
        departureDate: route.departureDate,
        returnDate: route.returnDate,
        flightMode: route.flightMode,
        currency: route.currency,
        currentPrice: route.currentPrice,
      });
      onSaved();
    } catch {
      return;
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-alert-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="price-alert-title">Get price alerts</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="price-alert-route">
          {cityFor(route.origin)} ({route.origin}) → {cityFor(route.destination)} ({route.destination})
        </p>
        <p className="muted">
          {formatShortDate(route.departureDate)}
          {route.returnDate ? ` – ${formatShortDate(route.returnDate)}` : ''} · lowest now{' '}
          {formatMoney(route.currency, route.currentPrice)}
        </p>
        {isSuccess ? (
          <div className="stack">
            <p>We’ll email you if this fare drops below {formatMoney(route.currency, route.currentPrice)}.</p>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form
            className="stack"
            onSubmit={handleSubmit((values) => {
              void onSubmit(values);
            })}
            noValidate
          >
            <AlertFormFields register={register} errors={errors} />
            {formError ? <p className="field-error">{formError}</p> : null}
            <AlertSubmitButton isSubmitting={isSubmitting} />
          </form>
        )}
      </div>
    </div>
  );
};
