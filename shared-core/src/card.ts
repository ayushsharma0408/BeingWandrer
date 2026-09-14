export const CARD_BRANDS = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'] as const;

export type CardBrand = (typeof CARD_BRANDS)[number];

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  DISCOVER: 'Discover',
};

export const cardDigitLength = (brand: CardBrand): number => (brand === 'AMEX' ? 15 : 16);

export const cardCvvLength = (brand: CardBrand): number => (brand === 'AMEX' ? 4 : 3);

export const cardPrefix = (brand: CardBrand): string => {
  const prefixes: Record<CardBrand, string> = {
    VISA: '4',
    MASTERCARD: '5',
    AMEX: '3',
    DISCOVER: '6',
  };
  return prefixes[brand];
};

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

export const formatCardNumber = (value: string, brand?: CardBrand): string => {
  const max = brand ? cardDigitLength(brand) : 16;
  const digits = digitsOnly(value).slice(0, max);
  if (brand === 'AMEX') {
    const part1 = digits.slice(0, 4);
    const part2 = digits.slice(4, 10);
    const part3 = digits.slice(10, 15);
    return [part1, part2, part3].filter(Boolean).join(' ');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

export const formatExpDate = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const isValidCardNumber = (brand: CardBrand, number: string): boolean => {
  const digits = digitsOnly(number);
  return digits.startsWith(cardPrefix(brand)) && digits.length === cardDigitLength(brand);
};

export const isValidExpDate = (expDate: string): boolean => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expDate)) {
    return false;
  }
  const [monthRaw, yearRaw] = expDate.split('/');
  const month = Number(monthRaw);
  const year = Number(yearRaw);
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || year > currentYear + 30) {
    return false;
  }
  if (year === currentYear && month < currentMonth) {
    return false;
  }
  return true;
};

export const isValidCvv = (brand: CardBrand, cvv: string): boolean => {
  return new RegExp(`^\\d{${cardCvvLength(brand)}}$`).test(cvv);
};

export const isValidCardHolderName = (holderName: string): boolean => {
  const trimmed = holderName.trim();
  return /^[a-zA-Z\s]+$/.test(trimmed) && trimmed.split(/\s+/).length >= 2;
};
