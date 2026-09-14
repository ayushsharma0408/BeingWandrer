export type AirlineRecord = {
  code: string;
  name: string;
  image: string;
};

let byCode = new Map<string, AirlineRecord>();
let byName = new Map<string, AirlineRecord>();
let loadPromise: Promise<void> | null = null;

const foldName = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\b(limited|ltd|airlines|airline|airways|aviation|the)\b/g, '')
    .replace(/[^a-z0-9]+/g, '');
};

export const preloadAirlineCatalog = (): Promise<void> => {
  loadPromise ??= fetch('/data/airlines.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Airline catalog failed to load');
      }
      return response.json() as Promise<AirlineRecord[]>;
    })
    .then((rows) => {
      byCode = new Map();
      byName = new Map();
      for (const row of rows) {
        byCode.set(row.code.toUpperCase(), row);
        byName.set(foldName(row.name), row);
        byName.set(foldName(row.code), row);
      }
    })
    .catch(() => {
      loadPromise = null;
    });
  return loadPromise;
};

export const airlineIconFor = (code: string | undefined, name: string): AirlineRecord | undefined => {
  if (code) {
    const byAirlineCode = byCode.get(code.toUpperCase());
    if (byAirlineCode) {
      return byAirlineCode;
    }
  }
  const folded = foldName(name);
  return byName.get(folded);
};

export const isAirlineCatalogReady = (): boolean => byCode.size > 0;
