import { useEffect, useRef } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useSitePrefs } from '@shared/i18n';
import type { FlightSearchFormValues } from '../../model/search-schema';

interface CabinFieldProps {
  watch: UseFormWatch<FlightSearchFormValues>;
  setValue: UseFormSetValue<FlightSearchFormValues>;
}

interface TravellerCabinFieldProps extends CabinFieldProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TravellerCabinField = ({ watch, setValue, isOpen, onOpenChange }: TravellerCabinFieldProps): JSX.Element => {
  const { t } = useSitePrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const adults = Number(watch('adults'));
  const children = Number(watch('children'));
  const infants = Number(watch('infants'));
  const cabin = watch('travelClass');
  const cabinLabel =
    cabin === 'PremiumEconomy'
      ? t('search.premiumEconomy')
      : cabin === 'Business'
        ? t('search.business')
        : cabin === 'First'
          ? t('search.first')
          : t('search.economy');
  const total = adults + children + infants;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onPointer = (event: MouseEvent): void => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', onPointer);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div className="tv-travelers" ref={panelRef}>
      <span className="tv-airport-label">{t('search.travelers')}</span>
      <button type="button" className="tv-travelers-btn" onClick={() => onOpenChange(!isOpen)}>
        <strong>
          {total} {total === 1 ? t('search.traveler') : t('search.travelers')}
        </strong>
      </button>
      <span className="tv-airport-meta">{cabinLabel}</span>
      {isOpen ? (
        <div className="traveller-panel">
          <Stepper label={t('search.adults')} hint={t('search.adultsHint')} value={adults} min={1} onChange={(value) => setValue('adults', value)} />
          <Stepper label={t('search.children')} hint={t('search.childrenHint')} value={children} min={0} onChange={(value) => setValue('children', value)} />
          <Stepper label={t('search.infants')} hint={t('search.infantsHint')} value={infants} min={0} onChange={(value) => setValue('infants', value)} />
        </div>
      ) : null}
    </div>
  );
};

export const CabinSelect = ({ watch, setValue }: CabinFieldProps): JSX.Element => {
  const { t } = useSitePrefs();
  const travelClass = watch('travelClass');
  return (
    <select
      className="tv-cabin"
      value={travelClass}
      onChange={(event) => setValue('travelClass', event.target.value as FlightSearchFormValues['travelClass'])}
    >
      <option value="Economy">{t('search.economy')}</option>
      <option value="PremiumEconomy">{t('search.premiumEconomy')}</option>
      <option value="Business">{t('search.business')}</option>
      <option value="First">{t('search.first')}</option>
    </select>
  );
};

interface StepperProps {
  label: string;
  hint: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}

const Stepper = ({ label, hint, value, min, onChange }: StepperProps): JSX.Element => {
  return (
    <div className="stepper">
      <span>
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
      <span className="stepper-controls">
        <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Fewer ${label}`}>
          −
        </button>
        <b>{value}</b>
        <button type="button" disabled={value >= 9} onClick={() => onChange(Math.min(9, value + 1))} aria-label={`More ${label}`}>
          +
        </button>
      </span>
    </div>
  );
};
