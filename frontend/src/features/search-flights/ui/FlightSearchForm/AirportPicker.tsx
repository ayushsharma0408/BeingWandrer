import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import {
  airportNameFor,
  airportRecordFor,
  cityFor,
  displayCity,
  preloadAirportCatalog,
  searchAirports,
} from '@shared/lib/airport-catalog';
import type { FlightSearchFormValues } from '../../model/search-schema';

interface AirportPickerProps {
  label: string;
  field: 'origin' | 'destination';
  icon: ReactNode;
  register: UseFormRegister<FlightSearchFormValues>;
  watch: UseFormWatch<FlightSearchFormValues>;
  setValue: UseFormSetValue<FlightSearchFormValues>;
  error?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelected: () => void;
}

export const AirportPicker = ({
  label,
  field,
  icon,
  register,
  watch,
  setValue,
  error,
  isOpen,
  onOpenChange,
  onSelected,
}: AirportPickerProps): JSX.Element => {
  const code = watch(field);
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);
  const boxRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    void preloadAirportCatalog().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onPointer = (event: MouseEvent): void => {
      if (!boxRef.current?.contains(event.target as Node)) {
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

  const chooseAirport = (nextCode: string): void => {
    setValue(field, nextCode, { shouldValidate: true });
    setQuery('');
    onSelected();
  };

  const matches = useMemo(() => (ready ? searchAirports(query) : []), [query, ready]);
  const city = cityFor(code);
  const name = airportRecordFor(code)?.name ?? airportNameFor(code);

  return (
    <label className="tv-airport" ref={boxRef}>
      <span className="tv-airport-label">
        {icon}
        {label}
      </span>
      <input type="hidden" {...register(field)} />
      {isOpen ? (
        <input
          className="tv-airport-query"
          value={query}
          autoFocus
          placeholder="City or airport"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onOpenChange(false);
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              const first = matches[0];
              if (first) {
                chooseAirport(first.code);
              }
            }
          }}
        />
      ) : (
        <button type="button" className="tv-airport-trigger" onClick={() => onOpenChange(true)}>
          {city}
        </button>
      )}
      <span className="tv-airport-meta">
        {code.toUpperCase()}
        {name ? `, ${name}` : ''}
      </span>
      {isOpen ? (
        <div className="tv-airport-suggest" role="listbox">
          {matches.length === 0 ? <p className="muted">No airports match that search.</p> : null}
          {matches.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseAirport(airport.code)}
            >
              <strong>
                {displayCity(airport)} ({airport.code})
              </strong>
              <span>
                {airport.name}
                {airport.country ? ` · ${airport.country}` : ''}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </label>
  );
};
