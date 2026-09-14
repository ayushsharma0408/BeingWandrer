import { MARKUP_TYPES } from '@best-in-flights-booking/shared-core';

interface RouteLabel {
  referenceName: string;
  origin: string;
  destination: string;
}

interface MarkupLabel {
  markupType: string;
  markupAmount: number;
}

export const describeRoute = (route: RouteLabel): string => {
  return `${route.referenceName} (${route.origin} → ${route.destination})`;
};

export const describeMarkup = (markup: MarkupLabel, route?: RouteLabel | null): string => {
  const amount =
    markup.markupType === MARKUP_TYPES.PERCENTAGE ? `${markup.markupAmount}%` : String(markup.markupAmount);
  const kind =
    markup.markupType === MARKUP_TYPES.DISCOUNT
      ? 'discount'
      : markup.markupType === MARKUP_TYPES.PERCENTAGE
        ? 'percentage markup'
        : 'fixed markup';
  return route ? `${kind} ${amount} on ${describeRoute(route)}` : `${kind} ${amount}`;
};

export const describeLogin = (action: string): string => {
  return action
    .replace('Logged in (ADMIN_PORTAL)', 'Logged in to the admin portal')
    .replace('Logged in (CONSUMER)', 'Logged in on the website')
    .replaceAll('_', ' ');
};
