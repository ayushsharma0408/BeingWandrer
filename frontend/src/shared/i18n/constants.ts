export const CURRENCY_CODES = ['USD', 'CAD', 'EUR', 'GBP', 'JPY', 'INR'] as const;
export const LANGUAGE_CODES = ['en', 'fr', 'de', 'es', 'ja', 'hi'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = 'INR';
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const CURRENCY_STORAGE_KEY = 'baf.currency';
export const LANGUAGE_STORAGE_KEY = 'baf.language';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'En',
  fr: 'Fr',
  de: 'De',
  es: 'Es',
  ja: 'Ja',
  hi: 'Hi',
};

export const LANGUAGE_LOCALES: Record<LanguageCode, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  ja: 'ja-JP',
  hi: 'hi-IN',
};

export const isCurrencyCode = (value: string | null | undefined): value is CurrencyCode => {
  return Boolean(value && CURRENCY_CODES.includes(value.toUpperCase() as CurrencyCode));
};

export const parseCurrencyCode = (value: string | null | undefined): CurrencyCode | null => {
  const normalized = value?.toUpperCase();
  return isCurrencyCode(normalized) ? (normalized as CurrencyCode) : null;
};

export const isLanguageCode = (value: string | null | undefined): value is LanguageCode => {
  return Boolean(value && LANGUAGE_CODES.includes(value as LanguageCode));
};
