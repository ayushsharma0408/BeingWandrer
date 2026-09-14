import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isCurrencyCode,
  isLanguageCode,
  type CurrencyCode,
  type LanguageCode,
} from './constants';
import { MESSAGES, type MessageKey } from './messages';

interface SitePrefsValue {
  currency: CurrencyCode;
  language: LanguageCode;
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: LanguageCode) => void;
  t: (key: MessageKey) => string;
}

const SitePrefsContext = createContext<SitePrefsValue | null>(null);

const readCurrency = (): CurrencyCode => {
  try {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    return isCurrencyCode(stored) ? stored : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
};

const readLanguage = (): LanguageCode => {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguageCode(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const applyLanguage = (language: LanguageCode): void => {
  document.documentElement.lang = language;
};

export const SitePrefsProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readCurrency);
  const [language, setLanguageState] = useState<LanguageCode>(readLanguage);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  }, []);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    applyLanguage(next);
  }, []);

  const t = useCallback(
    (key: MessageKey): string => {
      return MESSAGES[language][key] ?? MESSAGES.en[key];
    },
    [language],
  );

  const value = useMemo(
    () => ({ currency, language, setCurrency, setLanguage, t }),
    [currency, language, setCurrency, setLanguage, t],
  );

  return <SitePrefsContext.Provider value={value}>{children}</SitePrefsContext.Provider>;
};

export const useSitePrefs = (): SitePrefsValue => {
  const value = useContext(SitePrefsContext);
  if (!value) {
    throw new Error('useSitePrefs must be used within SitePrefsProvider');
  }
  return value;
};
