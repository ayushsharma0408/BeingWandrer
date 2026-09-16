import { useEffect, useMemo, useRef, useState } from 'react';
import { searchStates } from '@shared/lib/country-regions';

interface StateSelectProps {
  label: string;
  value: string;
  iso: string;
  countryName: string;
  error?: string;
  onChange: (next: string) => void;
}

export const StateSelect = ({ label, value, iso, countryName, error, onChange }: StateSelectProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const matches = useMemo(() => searchStates(iso, countryName, query), [iso, countryName, query]);

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

  const choose = (next: string): void => {
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
        <span className={value ? 'country-code-name is-primary' : 'country-code-name'}>{value || 'Select state'}</span>
      </button>
      {open ? (
        <div className="country-code-panel">
          <input
            className="country-code-search"
            value={query}
            autoFocus
            placeholder="Search state"
            aria-label="Search state"
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
            {matches.length === 0 ? <p className="muted">No states match that search.</p> : null}
            {matches.map((state) => (
              <button
                key={state}
                type="button"
                role="option"
                aria-selected={state === value}
                className={state === value ? 'country-code-option is-active' : 'country-code-option'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(state)}
              >
                <span>{state}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
};
