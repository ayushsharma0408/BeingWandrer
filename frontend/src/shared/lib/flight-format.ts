import { LANGUAGE_LOCALES } from '@shared/i18n';

const dateLocale = (): string => {
  if (typeof document === 'undefined') {
    return LANGUAGE_LOCALES.en;
  }
  const lang = document.documentElement.lang;
  return LANGUAGE_LOCALES[lang as keyof typeof LANGUAGE_LOCALES] ?? LANGUAGE_LOCALES.en;
};

export const shiftIsoDate = (iso: string, days: number): string => {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const formatClock = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatShortDate = (iso: string): string => {
  const date = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short', weekday: 'short' });
};

export const formatDetailDate = (iso: string): string => {
  const date = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(dateLocale(), { weekday: 'short', month: 'short', day: '2-digit' });
};

export const formatDetailDateTime = (iso: string): string => {
  return `${formatClock(iso)} • ${formatDetailDate(iso)}`;
};

export const sameCalendarDay = (leftIso: string, rightIso: string): boolean => {
  const left = new Date(leftIso);
  const right = new Date(rightIso);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
    return true;
  }
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

export const minutesBetween = (startIso: string, endIso: string): number => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }
  return Math.round((end - start) / 60000);
};

export const formatPrettyDate = (iso: string): { day: string; rest: string; weekday: string } => {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { day: iso, rest: '', weekday: '' };
  }
  const day = String(date.getDate());
  const rest = `${date.toLocaleDateString(dateLocale(), { month: 'short' })}' ${String(date.getFullYear()).slice(2)}`;
  const weekday = date.toLocaleDateString(dateLocale(), { weekday: 'long' });
  return { day, rest, weekday };
};

export const formatDuration = (value: string): string => {
  const minutes = durationMinutes(value);
  if (!minutes && !/^\d+:\d+/.test(value)) {
    return value;
  }
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

export const durationMinutes = (value: string): number => {
  const iso = /^PT(?:(\d+)H)?(?:(\d+)M)?$/i.exec(value.trim());
  if (iso) {
    return Number(iso[1] ?? 0) * 60 + Number(iso[2] ?? 0);
  }
  const clock = value.split(':').map(Number);
  if (clock.length >= 2 && clock.every((part) => Number.isFinite(part))) {
    return (clock[0] ?? 0) * 60 + (clock[1] ?? 0);
  }
  const labeled = /(\d+)\s*h[^\d]*(\d+)\s*m/i.exec(value);
  if (labeled) {
    return Number(labeled[1]) * 60 + Number(labeled[2]);
  }
  return 0;
};

export const hourOf = (iso: string): number => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }
  return date.getHours() + date.getMinutes() / 60;
};

export const formatMoney = (currency: string, amount: number): string => {
  try {
    return new Intl.NumberFormat(dateLocale(), {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString(dateLocale())}`;
  }
};

export const formatBagCount = (quantity: number): string => {
  return `${quantity} ${quantity === 1 ? 'piece' : 'pieces'}`;
};

export const formatBagWeight = (weightAllowance: number, unit?: string): string => {
  if (!weightAllowance) {
    return 'Not specified';
  }
  const normalized = (unit ?? '').toUpperCase();
  const weightUnit = normalized === 'PCS' || normalized === 'PC' || normalized === '' ? 'kg' : unit?.toLowerCase();
  return `${weightAllowance} ${weightUnit}`;
};

export const terminalLabel = (terminal?: string): string => {
  const value = terminal?.trim() ?? '';
  if (!value) {
    return '';
  }
  const normalized = value.toLowerCase().replace(/[_-]+/g, ' ');
  if (
    normalized === 'n/a' ||
    normalized === 'na' ||
    normalized === 'none' ||
    normalized === 'null' ||
    normalized === 'unknown' ||
    normalized === 'not available' ||
    normalized === 'notapplicable' ||
    normalized === 'tbd'
  ) {
    return '';
  }
  return value;
};

export const airlineInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
};

const AIRLINE_SWATCHES = ['#e11d48', '#2563eb', '#059669', '#7c3aed', '#d97706', '#0f766e'] as const;

export const airlineSwatch = (name: string): string => {
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AIRLINE_SWATCHES[hash % AIRLINE_SWATCHES.length] ?? AIRLINE_SWATCHES[0];
};
