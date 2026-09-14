import { useState } from 'react';
import { MdFlight } from 'react-icons/md';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSitePrefs } from '@shared/i18n';
import { flightSearchSchema, type FlightSearchFormValues } from '../model/search-schema';
import { useFlightSearch } from '../model/use-flight-search';
import { AirportFields, DateFields, type SearchPanel } from './FlightSearchForm/SearchFields';
import { CabinSelect, TravellerCabinField } from './FlightSearchForm/TravellerCabinField';

const nextSearchPanel = (
  from: SearchPanel,
  flightMode: FlightSearchFormValues['flightMode'],
): SearchPanel | null => {
  if (from === 'origin') {
    return 'destination';
  }
  if (from === 'destination') {
    return 'departure';
  }
  if (from === 'departure') {
    return flightMode === 'Return' ? 'return' : 'travelers';
  }
  if (from === 'return') {
    return 'travelers';
  }
  return null;
};

const tomorrow = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const weekAhead = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

interface FlightSearchFormProps {
  variant?: 'hero' | 'compact';
  initialValues?: Partial<FlightSearchFormValues>;
}

export const FlightSearchForm = ({ variant = 'hero', initialValues }: FlightSearchFormProps): JSX.Element => {
  const submitSearch = useFlightSearch();
  const { t } = useSitePrefs();
  const [openPanel, setOpenPanel] = useState<SearchPanel | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FlightSearchFormValues>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: 'CCU',
      destination: 'BOM',
      departureDate: tomorrow(),
      returnDate: weekAhead(),
      adults: 1,
      children: 0,
      infants: 0,
      travelClass: 'Economy',
      flightMode: 'Return',
      ...initialValues,
    },
  });

  const flightMode = watch('flightMode');

  const advanceFrom = (panel: SearchPanel): void => {
    setOpenPanel(nextSearchPanel(panel, getValues('flightMode')));
  };

  const swapAirports = (): void => {
    const origin = getValues('origin');
    const destination = getValues('destination');
    setValue('origin', destination);
    setValue('destination', origin);
  };

  const fields = (
    <>
      {variant === 'hero' ? (
        <div className="tv-search-top">
          <label className="tv-radio">
            <input
              type="radio"
              checked={flightMode === 'Return'}
              onChange={() => setValue('flightMode', 'Return')}
            />
            {t('search.roundTrip')}
          </label>
          <label className="tv-radio">
            <input
              type="radio"
              checked={flightMode === 'OneWay'}
              onChange={() => {
                setValue('flightMode', 'OneWay');
                setOpenPanel((current) => (current === 'return' ? 'travelers' : current));
              }}
            />
            {t('search.oneWay')}
          </label>
          <CabinSelect watch={watch} setValue={setValue} />
        </div>
      ) : null}
      <div className="tv-search-row">
        <AirportFields
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
          onSwap={swapAirports}
          openPanel={openPanel}
          onOpenPanel={setOpenPanel}
          onAdvanceFrom={advanceFrom}
        />
        <DateFields
          register={register}
          watch={watch}
          setValue={setValue}
          getValues={getValues}
          errors={errors}
          isReturn={flightMode === 'Return'}
          openPanel={openPanel}
          onOpenPanel={setOpenPanel}
          onAdvanceFrom={advanceFrom}
        />
        <TravellerCabinField
          watch={watch}
          setValue={setValue}
          isOpen={openPanel === 'travelers'}
          onOpenChange={(open) => setOpenPanel(open ? 'travelers' : null)}
        />
      </div>
    </>
  );

  return (
    <form
      className={variant === 'compact' ? 'tv-search-bar' : 'tv-search'}
      onSubmit={handleSubmit((values) => submitSearch(values))}
      noValidate
    >
      {variant === 'compact' ? (
        <div className="wrap tv-search-bar-inner">
          {fields}
          <button type="submit" className="tv-modify">
            {t('search.modify')}
          </button>
        </div>
      ) : (
        <>
          {fields}
          <button type="submit" className="tv-search-cta">
            {t('search.search')}{' '}
            <span>
              <MdFlight className="tv-icon" aria-hidden />
            </span>
          </button>
        </>
      )}
    </form>
  );
};
