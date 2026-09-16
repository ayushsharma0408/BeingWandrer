import type { PassengerType } from './flights.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_AGE_YEARS = 120;

export const parseIsoDate = (value: string): Date | null => {
  if (!ISO_DATE.test(value)) {
    return null;
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
};

export const utcIsoDate = (date = new Date()): string => date.toISOString().slice(0, 10);

export const ageOnDate = (dateOfBirth: string, onDate: string): number | null => {
  const birth = parseIsoDate(dateOfBirth);
  const on = parseIsoDate(onDate);
  if (!birth || !on) {
    return null;
  }
  let age = on.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = on.getUTCMonth() - birth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && on.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age;
};

const shiftUtcYears = (iso: string, years: number): string => {
  const date = parseIsoDate(iso);
  if (!date) {
    return iso;
  }
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
};

const addUtcDays = (iso: string, days: number): string => {
  const date = parseIsoDate(iso);
  if (!date) {
    return iso;
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const earlierIso = (left: string, right: string): string => (left < right ? left : right);

export const passengerDobInputBounds = (
  passengerType: PassengerType,
  travelDate: string,
  today = utcIsoDate(),
): { min: string; max: string } => {
  const oldest = shiftUtcYears(travelDate, -MAX_AGE_YEARS);
  if (passengerType === 'ADULT') {
    return { min: oldest, max: earlierIso(today, shiftUtcYears(travelDate, -12)) };
  }
  if (passengerType === 'CHILD') {
    return {
      min: addUtcDays(shiftUtcYears(travelDate, -12), 1),
      max: earlierIso(today, shiftUtcYears(travelDate, -2)),
    };
  }
  return {
    min: addUtcDays(shiftUtcYears(travelDate, -2), 1),
    max: earlierIso(today, travelDate),
  };
};

export const passengerDobMessage = (
  dateOfBirth: string,
  passengerType: PassengerType,
  travelDate: string,
  today = utcIsoDate(),
): string | null => {
  if (!dateOfBirth.trim()) {
    return 'Date of birth is required';
  }
  if (!parseIsoDate(dateOfBirth)) {
    return 'Enter a valid date of birth';
  }
  if (dateOfBirth > today) {
    return 'Date of birth cannot be in the future';
  }
  const age = ageOnDate(dateOfBirth, travelDate);
  if (age === null) {
    return 'Enter a valid date of birth';
  }
  if (age < 0) {
    return 'Date of birth cannot be after the departure date';
  }
  if (age > MAX_AGE_YEARS) {
    return 'Enter a realistic date of birth';
  }
  if (passengerType === 'ADULT' && age < 12) {
    return 'Adults must be 12 years or older on the departure date';
  }
  if (passengerType === 'CHILD' && (age < 2 || age >= 12)) {
    return 'Children must be 2–11 years old on the departure date';
  }
  if (passengerType === 'INFANT' && age >= 2) {
    return 'Infants must be under 2 years old on the departure date';
  }
  return null;
};
