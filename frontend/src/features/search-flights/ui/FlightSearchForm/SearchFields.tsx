import { MdCalendarMonth, MdChevronLeft, MdChevronRight, MdFlightLand, MdFlightTakeoff, MdSwapHoriz } from 'react-icons/md';
import { useSitePrefs } from '@shared/i18n';
import { formatPrettyDate, shiftIsoDate } from '@shared/lib/flight-format';
import type { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { FlightSearchFormValues } from '../../model/search-schema';
import { AirportPicker } from './AirportPicker';
import { DateCalendar } from './DateCalendar';

export type SearchPanel = 'origin' | 'destination' | 'departure' | 'return' | 'travelers';

interface AirportFieldsProps {
  register: UseFormRegister<FlightSearchFormValues>;
  watch: UseFormWatch<FlightSearchFormValues>;
  setValue: UseFormSetValue<FlightSearchFormValues>;
  errors: FieldErrors<FlightSearchFormValues>;
  onSwap: () => void;
  openPanel: SearchPanel | null;
  onOpenPanel: (panel: SearchPanel | null) => void;
  onAdvanceFrom: (panel: SearchPanel) => void;
}

export const AirportFields = ({
  register,
  watch,
  setValue,
  errors,
  onSwap,
  openPanel,
  onOpenPanel,
  onAdvanceFrom,
}: AirportFieldsProps): JSX.Element => {
  const { t } = useSitePrefs();
  return (
    <>
      <AirportPicker
        label={t('search.from')}
        field="origin"
        icon={<MdFlightTakeoff className="tv-icon" aria-hidden />}
        register={register}
        watch={watch}
        setValue={setValue}
        error={errors.origin?.message}
        isOpen={openPanel === 'origin'}
        onOpenChange={(open) => onOpenPanel(open ? 'origin' : null)}
        onSelected={() => onAdvanceFrom('origin')}
      />
      <button type="button" className="tv-swap" onClick={onSwap} aria-label={t('search.swap')}>
        <MdSwapHoriz className="tv-icon" aria-hidden />
      </button>
      <AirportPicker
        label={t('search.to')}
        field="destination"
        icon={<MdFlightLand className="tv-icon" aria-hidden />}
        register={register}
        watch={watch}
        setValue={setValue}
        error={errors.destination?.message}
        isOpen={openPanel === 'destination'}
        onOpenChange={(open) => onOpenPanel(open ? 'destination' : null)}
        onSelected={() => onAdvanceFrom('destination')}
      />
    </>
  );
};

interface DateFieldsProps {
  register: UseFormRegister<FlightSearchFormValues>;
  watch: UseFormWatch<FlightSearchFormValues>;
  setValue: UseFormSetValue<FlightSearchFormValues>;
  getValues: UseFormGetValues<FlightSearchFormValues>;
  errors: FieldErrors<FlightSearchFormValues>;
  isReturn: boolean;
  openPanel: SearchPanel | null;
  onOpenPanel: (panel: SearchPanel | null) => void;
  onAdvanceFrom: (panel: SearchPanel) => void;
}

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const DateBox = ({
  label,
  value,
  min,
  disabled,
  error,
  isOpen,
  onOpenChange,
  onShift,
  onPick,
}: {
  label: string;
  value: string;
  min: string;
  disabled?: boolean;
  error?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onShift: (days: number) => void;
  onPick: (iso: string) => void;
}): JSX.Element => {
  const { t } = useSitePrefs();
  const pretty = formatPrettyDate(value);
  return (
    <div className={`tv-date ${disabled ? 'is-disabled' : ''}`}>
      <div className="tv-date-head">
        <span className="tv-airport-label">
          <MdCalendarMonth className="tv-icon" aria-hidden />
          {label}
        </span>
        <span className="tv-exact">{disabled ? t('search.oneWayLabel') : t('search.exact')}</span>
      </div>
      <div className="tv-date-row">
        <button type="button" disabled={disabled} onClick={() => onShift(-1)} aria-label={`Earlier ${label}`}>
          <MdChevronLeft className="tv-icon" aria-hidden />
        </button>
        <button type="button" className="tv-date-main" disabled={disabled} onClick={() => onOpenChange(true)}>
          <strong>
            {pretty.day} {pretty.rest}
          </strong>
        </button>
        <button type="button" disabled={disabled} onClick={() => onShift(1)} aria-label={`Later ${label}`}>
          <MdChevronRight className="tv-icon" aria-hidden />
        </button>
      </div>
      <span className="tv-airport-meta">{pretty.weekday || (disabled ? t('search.oneWayLabel') : '')}</span>
      {isOpen && !disabled ? (
        <DateCalendar
          value={value || min}
          min={min}
          onSelect={onPick}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
};

export const DateFields = ({
  register,
  watch,
  setValue,
  getValues,
  errors,
  isReturn,
  openPanel,
  onOpenPanel,
  onAdvanceFrom,
}: DateFieldsProps): JSX.Element => {
  const { t } = useSitePrefs();
  const departureDate = watch('departureDate');
  const returnDate = watch('returnDate') ?? '';
  const minDepart = todayIso();

  return (
    <>
      <input type="hidden" {...register('departureDate')} />
      <input type="hidden" {...register('returnDate')} />
      <DateBox
        label={t('search.depart')}
        value={departureDate}
        min={minDepart}
        error={errors.departureDate?.message}
        isOpen={openPanel === 'departure'}
        onOpenChange={(open) => onOpenPanel(open ? 'departure' : null)}
        onShift={(days) => {
          const next = shiftIsoDate(getValues('departureDate'), days);
          if (next < minDepart) {
            return;
          }
          setValue('departureDate', next, { shouldValidate: true });
          const currentReturn = getValues('returnDate') || next;
          if (currentReturn < next) {
            setValue('returnDate', next, { shouldValidate: true });
          }
        }}
        onPick={(iso) => {
          setValue('departureDate', iso, { shouldValidate: true });
          const currentReturn = getValues('returnDate') || iso;
          if (currentReturn < iso) {
            setValue('returnDate', iso, { shouldValidate: true });
          }
          onAdvanceFrom('departure');
        }}
      />
      <DateBox
        label={t('search.return')}
        value={isReturn ? returnDate : ''}
        min={departureDate || minDepart}
        disabled={!isReturn}
        error={errors.returnDate?.message}
        isOpen={openPanel === 'return'}
        onOpenChange={(open) => onOpenPanel(open ? 'return' : null)}
        onShift={(days) =>
          setValue('returnDate', shiftIsoDate(getValues('returnDate') || getValues('departureDate'), days), {
            shouldValidate: true,
          })
        }
        onPick={(iso) => {
          setValue('returnDate', iso, { shouldValidate: true });
          onAdvanceFrom('return');
        }}
      />
    </>
  );
};
