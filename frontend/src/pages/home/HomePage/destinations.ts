export const HOME_DESTINATIONS = [
  {
    origin: 'CCU',
    destination: 'BOM',
    city: 'Mumbai',
    route: 'Kolkata → Mumbai',
    tag: 'City break',
    tone: 'dest-mumbai',
    image: '/destinations/mumbai.jpg',
  },
  {
    origin: 'DEL',
    destination: 'BOM',
    city: 'Delhi',
    route: 'Delhi → Mumbai',
    tag: 'Most booked',
    tone: 'dest-delhi',
    image: '/destinations/delhi.jpg',
  },
  {
    origin: 'BOM',
    destination: 'GOI',
    city: 'Goa',
    route: 'Mumbai → Goa',
    tag: 'Beach escape',
    tone: 'dest-goa',
    image: '/destinations/goa.jpg',
  },
  {
    origin: 'DEL',
    destination: 'DXB',
    city: 'Dubai',
    route: 'Delhi → Dubai',
    tag: 'International',
    tone: 'dest-dubai',
    image: '/destinations/dubai.jpg',
  },
] as const;

export const tomorrowIso = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export const flightSearchPath = (origin: string, destination: string, currency = 'INR'): string =>
  `/flights?origin=${origin}&destination=${destination}&departureDate=${tomorrowIso()}&adults=1&children=0&infants=0&travelClass=Economy&flightMode=OneWay&currency=${currency}`;
