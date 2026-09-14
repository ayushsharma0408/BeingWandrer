export type AirportRecord = {
  code: string;
  city: string;
  name: string;
  country: string;
  state: string;
};

const CITY_LABELS: Record<string, string> = {
  AMD: 'Ahmedabad',
  ATQ: 'Amritsar',
  AUH: 'Abu Dhabi',
  BKK: 'Bangkok',
  BLR: 'Bengaluru',
  BOM: 'Mumbai',
  CCU: 'Kolkata',
  CDG: 'Paris',
  COK: 'Kochi',
  DEL: 'Delhi',
  DOH: 'Doha',
  DXB: 'Dubai',
  EWR: 'Newark',
  FRA: 'Frankfurt',
  GAU: 'Guwahati',
  GOI: 'Goa',
  GOX: 'North Goa',
  HYD: 'Hyderabad',
  IXC: 'Chandigarh',
  JAI: 'Jaipur',
  JFK: 'New York',
  LGW: 'London',
  LHR: 'London',
  LKO: 'Lucknow',
  MAA: 'Chennai',
  MCT: 'Muscat',
  PAT: 'Patna',
  PNQ: 'Pune',
  SFO: 'San Francisco',
  SHJ: 'Sharjah',
  SIN: 'Singapore',
  STN: 'London',
};

export const POPULAR_AIRPORT_CODES = ['CCU', 'BOM', 'DEL', 'BLR', 'HYD', 'MAA', 'GOI', 'DXB'] as const;

let catalog: AirportRecord[] = [];
let byCode = new Map<string, AirportRecord>();
let loadPromise: Promise<AirportRecord[]> | null = null;

const haystackFor = (airport: AirportRecord): string => {
  return [airport.code, displayCity(airport), airport.city, airport.name, airport.country, airport.state]
    .join(' ')
    .toLowerCase();
};

export const displayCity = (airport: AirportRecord): string => {
  return CITY_LABELS[airport.code] ?? (airport.city || airport.name.replace(/ airport$/i, '') || airport.code);
};

export const preloadAirportCatalog = (): Promise<AirportRecord[]> => {
  loadPromise ??= fetch('/data/airports.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Airport catalog failed to load');
      }
      return response.json() as Promise<AirportRecord[]>;
    })
    .then((rows) => {
      catalog = rows;
      byCode = new Map(rows.map((row) => [row.code, row]));
      return rows;
    })
    .catch(() => {
      loadPromise = null;
      return catalog;
    });
  return loadPromise;
};

export const airportRecordFor = (code: string): AirportRecord | undefined => {
  return byCode.get(code.toUpperCase());
};

export const cityFor = (code: string): string => {
  const upper = code.toUpperCase();
  const airport = airportRecordFor(upper);
  if (airport) {
    return displayCity(airport);
  }
  return CITY_LABELS[upper] ?? upper;
};

export const airportNameFor = (code: string): string => {
  return airportRecordFor(code)?.name ?? '';
};

export const cityCountryFor = (code: string): string => {
  const airport = airportRecordFor(code);
  if (!airport) {
    return cityFor(code);
  }
  const city = displayCity(airport);
  return airport.country ? `${city}, ${airport.country}` : city;
};

export const searchAirports = (query: string, limit = 12): AirportRecord[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return POPULAR_AIRPORT_CODES.map((code) => airportRecordFor(code)).filter((row): row is AirportRecord => Boolean(row));
  }
  const starts: AirportRecord[] = [];
  const contains: AirportRecord[] = [];
  for (const airport of catalog) {
    const haystack = haystackFor(airport);
    if (airport.code.toLowerCase() === needle) {
      return [airport];
    }
    if (airport.code.toLowerCase().startsWith(needle) || displayCity(airport).toLowerCase().startsWith(needle)) {
      starts.push(airport);
    } else if (haystack.includes(needle)) {
      contains.push(airport);
    }
    if (starts.length >= limit) {
      break;
    }
  }
  return [...starts, ...contains].slice(0, limit);
};
