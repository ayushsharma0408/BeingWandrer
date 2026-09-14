import type { SelectHTMLAttributes } from 'react';
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { MdCreditCard } from 'react-icons/md';
import {
  CARD_BRANDS,
  CARD_BRAND_LABELS,
  cardCvvLength,
  formatCardNumber,
  formatExpDate,
  type CardBrand,
} from '@best-in-flights-booking/shared-core';
import { Input } from '@shared/ui';
import type { BookingFormValues } from '../../../model/booking-schema';

interface CardDetailsFieldsProps {
  register: UseFormRegister<BookingFormValues>;
  watch: UseFormWatch<BookingFormValues>;
  setValue: UseFormSetValue<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

const FieldSelect = ({
  label,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }): JSX.Element => {
  return (
    <label className="field" htmlFor={props.id ?? props.name}>
      <span className="field-label">{label}</span>
      <select id={props.id ?? props.name} className="input" {...props}>
        {children}
      </select>
      {error ? <p className="field-error">{error}</p> : null}
    </label>
  );
};

export const CardDetailsFields = ({ register, watch, setValue, errors }: CardDetailsFieldsProps): JSX.Element => {
  const brand = watch('card.brand');
  const selectedBrand = CARD_BRANDS.includes(brand as CardBrand) ? (brand as CardBrand) : undefined;
  const numberMax = selectedBrand === 'AMEX' ? 17 : 19;
  const cvvMax = selectedBrand ? cardCvvLength(selectedBrand) : 4;

  return (
    <section className="card stack">
      <h2 className="checkout-card-title">
        <MdCreditCard className="tv-icon" aria-hidden /> Card details
      </h2>
      <p className="muted">We collect card details to ticket the booking. Full card numbers and CVV are not stored.</p>
      <div className="form-grid-3">
        <FieldSelect
          label="Card *"
          error={errors.card?.brand?.message}
          {...register('card.brand', {
            onChange: () => {
              setValue('card.number', '');
              setValue('card.expDate', '');
              setValue('card.cvv', '');
            },
          })}
        >
          <option value="">Select card</option>
          {CARD_BRANDS.map((option) => (
            <option key={option} value={option}>
              {CARD_BRAND_LABELS[option]}
            </option>
          ))}
        </FieldSelect>
        <Input
          label="Card holder name *"
          autoComplete="cc-name"
          disabled={!selectedBrand}
          error={errors.card?.holderName?.message}
          {...register('card.holderName')}
        />
        <Input
          label="Card number *"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder={selectedBrand === 'AMEX' ? 'xxxx xxxxxx xxxxx' : 'xxxx xxxx xxxx xxxx'}
          maxLength={numberMax}
          disabled={!selectedBrand}
          error={errors.card?.number?.message}
          {...register('card.number', {
            onChange: (event) => {
              setValue('card.number', formatCardNumber(event.target.value, selectedBrand), { shouldValidate: true });
            },
          })}
        />
        <Input
          label="Expiry (MM/YY) *"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          maxLength={5}
          disabled={!selectedBrand}
          error={errors.card?.expDate?.message}
          {...register('card.expDate', {
            onChange: (event) => {
              setValue('card.expDate', formatExpDate(event.target.value), { shouldValidate: true });
            },
          })}
        />
        <Input
          label="CVV *"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder={selectedBrand === 'AMEX' ? 'xxxx' : 'xxx'}
          maxLength={cvvMax}
          disabled={!selectedBrand}
          error={errors.card?.cvv?.message}
          {...register('card.cvv', {
            onChange: (event) => {
              const next = event.target.value.replace(/\D/g, '').slice(0, cvvMax);
              setValue('card.cvv', next, { shouldValidate: true });
            },
          })}
        />
      </div>
    </section>
  );
};
