import { useEffect, useRef, useState } from 'react';
import { MdCheck, MdExpandMore } from 'react-icons/md';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  CURRENCY_CODES,
  LANGUAGE_CODES,
  LANGUAGE_LABELS,
  useSitePrefs,
  type CurrencyCode,
} from '@shared/i18n';
import { CurrencyFlag } from './CurrencyFlag';

interface HeaderPrefsProps {
  className?: string;
}

export const HeaderPrefs = ({ className = 'tv-header-prefs' }: HeaderPrefsProps): JSX.Element => {
  const { currency, language, setCurrency, setLanguage, t } = useSitePrefs();
  const [open, setOpen] = useState<'currency' | 'language' | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onPointer = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(null);
      }
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(null);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const applyCurrency = (code: CurrencyCode): void => {
    setCurrency(code);
    setOpen(null);
    if (location.pathname.startsWith('/flights') && searchParams.get('origin')) {
      const next = new URLSearchParams(searchParams);
      next.set('currency', code);
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <div className={className} ref={rootRef}>
      <div className="tv-pref">
        <button
          type="button"
          className="tv-pref-btn"
          aria-haspopup="listbox"
          aria-expanded={open === 'currency'}
          aria-label={t('nav.currency')}
          onClick={() => setOpen((value) => (value === 'currency' ? null : 'currency'))}
        >
          <CurrencyFlag code={currency} />
          {currency}
          <MdExpandMore className="tv-icon" aria-hidden />
        </button>
        {open === 'currency' ? (
          <ul className="tv-pref-menu tv-pref-menu-light" role="listbox">
            {CURRENCY_CODES.map((code) => (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={code === currency}
                  className={code === currency ? 'is-active' : undefined}
                  onClick={() => applyCurrency(code)}
                >
                  <CurrencyFlag code={code} />
                  {code}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="tv-pref">
        <button
          type="button"
          className="tv-pref-btn"
          aria-haspopup="listbox"
          aria-expanded={open === 'language'}
          aria-label={t('nav.language')}
          onClick={() => setOpen((value) => (value === 'language' ? null : 'language'))}
        >
          {LANGUAGE_LABELS[language]}
          <MdExpandMore className="tv-icon" aria-hidden />
        </button>
        {open === 'language' ? (
          <ul className="tv-pref-menu tv-pref-menu-light" role="listbox">
            {LANGUAGE_CODES.map((code) => (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={code === language}
                  className={code === language ? 'is-active' : undefined}
                  onClick={() => {
                    setLanguage(code);
                    setOpen(null);
                  }}
                >
                  {code === language ? <MdCheck className="tv-icon" aria-hidden /> : <span className="tv-pref-check-gap" />}
                  {LANGUAGE_LABELS[code]}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};
