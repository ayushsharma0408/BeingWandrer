export const HOME_DESTINATIONS = [
  {
    origin: 'CCU',
    destination: 'BOM',
    city: 'Mumbai',
    route: 'Kolkata → Mumbai',
    tag: 'City break',
    tone: 'dest-mumbai',
    image:
      'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1200&q=70',
  },
  {
    origin: 'DEL',
    destination: 'BOM',
    city: 'Delhi',
    route: 'Delhi → Mumbai',
    tag: 'Most booked',
    tone: 'dest-delhi',
    image:
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=70',
  },
  {
    origin: 'BOM',
    destination: 'GOI',
    city: 'Goa',
    route: 'Mumbai → Goa',
    tag: 'Beach escape',
    tone: 'dest-goa',
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e1f1?auto=format&fit=crop&w=1200&q=70',
  },
  {
    origin: 'DEL',
    destination: 'DXB',
    city: 'Dubai',
    route: 'Delhi → Dubai',
    tag: 'International',
    tone: 'dest-dubai',
    image:
      'https://images.unsplash.com/photo-1512453979798-5ebe8093f97b?auto=format&fit=crop&w=1200&q=70',
  },
] as const;

export const tomorrowIso = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export const flightSearchPath = (origin: string, destination: string, currency = 'INR'): string =>
  `/flights?origin=${origin}&destination=${destination}&departureDate=${tomorrowIso()}&adults=1&children=0&infants=0&travelClass=Economy&flightMode=OneWay&currency=${currency}`;
