import { useNavigate } from 'react-router-dom';
import { useSitePrefs } from '@shared/i18n';
import type { FlightSearchFormValues } from './search-schema';

export const useFlightSearch = (): ((values: FlightSearchFormValues) => void) => {
  const navigate = useNavigate();
  const { currency } = useSitePrefs();

  return (values: FlightSearchFormValues): void => {
    const params = new URLSearchParams({
      origin: values.origin.toUpperCase(),
      destination: values.destination.toUpperCase(),
      departureDate: values.departureDate,
      adults: String(values.adults),
      children: String(values.children),
      infants: String(values.infants),
      travelClass: values.travelClass,
      flightMode: values.flightMode,
      currency,
    });
    if (values.flightMode === 'Return' && values.returnDate) {
      params.set('returnDate', values.returnDate);
    }
    navigate(`/flights?${params.toString()}`);
  };
};
