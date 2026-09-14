import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@shared/ui';
import type { BookingFormValues } from '../../model/booking-schema';

interface PassengerFieldsProps {
  index: number;
  passengerType: BookingFormValues['passengers'][number]['passengerType'];
  register: UseFormRegister<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

const typeLabel = (type: BookingFormValues['passengers'][number]['passengerType']): string => {
  if (type === 'CHILD') {
    return 'Child';
  }
  if (type === 'INFANT') {
    return 'Infant';
  }
  return 'Adult';
};

export const PassengerFields = ({ index, passengerType, register, errors }: PassengerFieldsProps): JSX.Element => {
  const passengerError = errors.passengers?.[index];
  return (
    <fieldset className="traveller-card">
      <legend>
        Traveller {index + 1} <span className="text-primary">{typeLabel(passengerType)}</span>
      </legend>
      <input type="hidden" {...register(`passengers.${index}.passengerType`)} />
      <div className="form-grid-3">
        <Input
          label="First name *"
          error={passengerError?.firstName?.message}
          {...register(`passengers.${index}.firstName`)}
        />
        <Input label="Middle name" error={passengerError?.middleName?.message} {...register(`passengers.${index}.middleName`)} />
        <Input
          label="Last name *"
          error={passengerError?.lastName?.message}
          {...register(`passengers.${index}.lastName`)}
        />
        <Input
          label="Date of birth *"
          type="date"
          error={passengerError?.dateOfBirth?.message}
          {...register(`passengers.${index}.dateOfBirth`)}
        />
        <fieldset className="field">
          <legend className="field-label">Gender *</legend>
          <div className="choice-row">
            <label>
              <input type="radio" value="MALE" {...register(`passengers.${index}.gender`)} /> Male
            </label>
            <label>
              <input type="radio" value="FEMALE" {...register(`passengers.${index}.gender`)} /> Female
            </label>
          </div>
          {passengerError?.gender?.message ? <p className="field-error">{passengerError.gender.message}</p> : null}
        </fieldset>
      </div>
    </fieldset>
  );
};
