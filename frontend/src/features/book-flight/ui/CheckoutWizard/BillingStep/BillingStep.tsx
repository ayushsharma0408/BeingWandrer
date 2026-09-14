import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { MdOutlineHome } from 'react-icons/md';
import { Input } from '@shared/ui';
import { useAppSelector } from '@shared/store';
import type { BookingFormValues } from '../../../model/booking-schema';
import { CardDetailsFields } from './CardDetailsFields';

interface BillingStepProps {
  register: UseFormRegister<BookingFormValues>;
  watch: UseFormWatch<BookingFormValues>;
  setValue: UseFormSetValue<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
  onOpenAuth: () => void;
}

export const BillingStep = ({ register, watch, setValue, errors, onOpenAuth }: BillingStepProps): JSX.Element => {
  const user = useAppSelector((state) => state.user.current);
  return (
    <>
      <section className="card stack">
        <h1 className="checkout-card-title">
          <MdOutlineHome className="tv-icon" aria-hidden /> Billing details
        </h1>
        {user ? (
          <p className="muted">Signed in as {user.fullName ?? user.email}. This trip will be saved to My trips.</p>
        ) : (
          <p className="muted">
            You can confirm as a guest. Optional:{' '}
            <button type="button" className="link-button" onClick={onOpenAuth}>
              sign in
            </button>{' '}
            to keep the booking in your account.
          </p>
        )}
        <div className="form-grid-3">
          <Input label="Full name *" error={errors.contact?.fullName?.message} {...register('contact.fullName')} />
          <Input label="Email *" type="email" error={errors.contact?.email?.message} {...register('contact.email')} />
          <Input label="Country *" error={errors.contact?.country?.message} {...register('contact.country')} />
          <Input label="Country code *" placeholder="+91" error={errors.contact?.countryCode?.message} {...register('contact.countryCode')} />
          <Input label="Phone *" inputMode="tel" error={errors.contact?.phone?.message} {...register('contact.phone')} />
          <Input label="Address *" error={errors.contact?.address?.message} {...register('contact.address')} />
          <Input label="State *" error={errors.contact?.state?.message} {...register('contact.state')} />
          <Input label="City *" error={errors.contact?.city?.message} {...register('contact.city')} />
          <Input label="PIN / ZIP *" error={errors.contact?.zip?.message} {...register('contact.zip')} />
        </div>
      </section>
      <CardDetailsFields register={register} watch={watch} setValue={setValue} errors={errors} />
      <section className="card stack">
        <label className="choice-row">
          <input type="checkbox" {...register('acceptedTerms')} />
          <span>I accept the terms and conditions and confirm traveller names match official ID.</span>
        </label>
        {errors.acceptedTerms?.message ? <p className="field-error">{errors.acceptedTerms.message}</p> : null}
      </section>
    </>
  );
};
