import { useEffect, useMemo, useRef, useState } from 'react';
import { countryByName, searchCountryDials, type CountryDial } from '@shared/lib/country-codes';
import { CountryFlag } from './CountryFlag';

interface CountrySelectProps {
  label: string;
  value: string;
  error?: string;
  onChange: (next: CountryDial) => void;
}

export const CountrySelect = ({ label, value, error, onChange }: CountrySelectProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const selected = countryByName(value);
  const matches = useMemo(() => searchCountryDials(query), [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return undefined;
    }
    const onPointer = (event: MouseEvent): void => {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', onPointer);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const choose = (next: CountryDial): void => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="field country-code-select" ref={boxRef}>
      <span className="field-label">{label}</span>
      <button
        type="button"
        className="country-code-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <CountryFlag iso={selected.iso} name={selected.name} />
        <span className="country-code-name is-primary">{selected.name}</span>
      </button>
      {open ? (
        <div className="country-code-panel">
          <input
            className="country-code-search"
            value={query}
            autoFocus
            placeholder="Search country"
            aria-label="Search country"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                const first = matches[0];
                if (first) {
                  choose(first);
                }
              }
            }}
          />
          <div className="country-code-list" role="listbox">
            {matches.length === 0 ? <p className="muted">No countries match that search.</p> : null}
            {matches.map((row) => (
              <button
                key={row.iso}
                type="button"
                role="option"
                aria-selected={row.iso === selected.iso}
                className={row.iso === selected.iso ? 'country-code-option is-active' : 'country-code-option'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(row)}
              >
                <CountryFlag iso={row.iso} name={row.name} />
                <span>{row.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
};
