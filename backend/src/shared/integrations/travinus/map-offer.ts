import type { FlightEndpoint, FlightLeg, FlightOffer, FlightSegment } from '@best-in-flights-booking/shared-core';

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const normalizeTerminal = (value: unknown): string => {
  const terminal = asString(value).trim();
  if (!terminal) {
    return '';
  }
  const normalized = terminal.toLowerCase().replace(/[_-]+/g, ' ');
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
  return terminal;
};

const durationBetween = (startIso: string, endIso: string): string => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return '';
  }
  const totalMinutes = Math.round((end - start) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const normalizeDuration = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  const clock = /^(\d+):(\d+)(?::\d+)?$/.exec(trimmed);
  if (clock) {
    return `${clock[1]}:${clock[2]}`;
  }
  return trimmed;
};

const mapEndpoint = (
  raw: Record<string, unknown> | null,
  overrides: Partial<{ at: string; flightNumber: string; carrierCode: string; carrierName: string; aircraftName: string }> = {},
): FlightEndpoint | null => {
  if (!raw) {
    return null;
  }
  const iataCode = asString(raw.iataCode);
  const at = overrides.at || asString(raw.at);
  if (!iataCode || !at) {
    return null;
  }
  const endpoint: FlightEndpoint = {
    iataCode,
    airportName: asString(raw.airportName, iataCode),
    at,
    carrierCode: overrides.carrierCode || asString(raw.carrierCode),
    carrierName: overrides.carrierName || asString(raw.carrierName),
    flightNumber: overrides.flightNumber || asString(raw.number),
  };
  if (normalizeTerminal(raw.terminal)) {
    endpoint.terminal = normalizeTerminal(raw.terminal);
  }
  const aircraftName = overrides.aircraftName || asString(raw.aircraftName);
  if (aircraftName) {
    endpoint.aircraftName = aircraftName;
  }
  if (asString(raw.cabin)) {
    endpoint.cabin = asString(raw.cabin);
  }
  return endpoint;
};

const isMiniLeg = (value: unknown): value is Record<string, unknown> => {
  const record = asRecord(value);
  return Boolean(record && asRecord(record.departure) && asRecord(record.arrival));
};

const toSegment = (
  departure: FlightEndpoint,
  arrival: FlightEndpoint,
  flightNumber: string,
  durationHint?: string,
): FlightSegment => {
  return {
    duration: normalizeDuration(durationHint || '') || durationBetween(departure.at, arrival.at),
    departure,
    arrival,
    flightNumber: flightNumber || departure.flightNumber,
  };
};

const buildSegments = (
  departure: FlightEndpoint,
  arrival: FlightEndpoint,
  flightNumber: string,
  duration: string,
  departureRaw: Record<string, unknown>,
  arrivalRaw: Record<string, unknown>,
  layoversRaw: unknown,
): FlightSegment[] => {
  const layovers = Array.isArray(layoversRaw) ? layoversRaw : [];
  if (layovers.length === 0) {
    return [
      toSegment(
        departure,
        arrival,
        flightNumber,
        asString(departureRaw.flightDuration, duration),
      ),
    ];
  }

  if (layovers.every(isMiniLeg)) {
    const firstLayover = layovers[0] as Record<string, unknown>;
    const firstArrival = mapEndpoint(asRecord(firstLayover.departure));
    if (!firstArrival) {
      return [toSegment(departure, arrival, flightNumber, duration)];
    }

    const segments: FlightSegment[] = [
      toSegment(departure, firstArrival, flightNumber, asString(departureRaw.flightDuration)),
    ];
    for (const layover of layovers) {
      const record = layover as Record<string, unknown>;
      const segmentDeparture = mapEndpoint(asRecord(record.departure));
      const segmentArrival = mapEndpoint(asRecord(record.arrival));
      if (!segmentDeparture || !segmentArrival) {
        continue;
      }
      segments.push(
        toSegment(
          segmentDeparture,
          segmentArrival,
          asString(record.flightNumber, segmentDeparture.flightNumber),
          asString(record.duration, asString(record.flightDuration)),
        ),
      );
    }
    return segments.length > 0 ? segments : [toSegment(departure, arrival, flightNumber, duration)];
  }

  const segments: FlightSegment[] = [];
  let currentDeparture = departure;
  let currentDurationHint = asString(departureRaw.flightDuration, duration);

  for (const layoverItem of layovers) {
    const layover = asRecord(layoverItem);
    if (!layover) {
      continue;
    }

    const stopArrival = mapEndpoint(layover, {
      at: asString(layover.arrivalTime, asString(layover.at)),
      flightNumber: currentDeparture.flightNumber,
      carrierCode: currentDeparture.carrierCode,
      carrierName: currentDeparture.carrierName,
      aircraftName: currentDeparture.aircraftName,
    });
    if (!stopArrival) {
      continue;
    }

    segments.push(toSegment(currentDeparture, stopArrival, currentDeparture.flightNumber, currentDurationHint));

    const nextDeparture = mapEndpoint(layover, {
      at: asString(layover.departureTime, asString(layover.at)),
    });
    if (!nextDeparture) {
      continue;
    }
    currentDeparture = nextDeparture;
    currentDurationHint = asString(layover.flightDuration);
  }

  segments.push(
    toSegment(
      currentDeparture,
      arrival,
      currentDeparture.flightNumber || asString(arrivalRaw.number, flightNumber),
      currentDurationHint || asString(arrivalRaw.flightDuration),
    ),
  );

  return segments.length > 0 ? segments : [toSegment(departure, arrival, flightNumber, duration)];
};

const mapLeg = (raw: unknown): FlightLeg | null => {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }
  const departureRaw = asRecord(record.departure);
  const arrivalRaw = asRecord(record.arrival);
  const departure = mapEndpoint(departureRaw);
  const arrival = mapEndpoint(arrivalRaw);
  if (!departure || !arrival || !departureRaw || !arrivalRaw) {
    return null;
  }
  const flightNumber = asString(record.flightNumber, departure.flightNumber);
  const duration = normalizeDuration(asString(record.duration));
  const segments = buildSegments(
    departure,
    arrival,
    flightNumber,
    duration,
    departureRaw,
    arrivalRaw,
    record.layovers,
  );
  return {
    duration,
    departure,
    arrival,
    numberOfStops: asNumber(record.numberOfStops, Math.max(0, segments.length - 1)),
    flightNumber,
    segments,
  };
};

const mapBaggage = (
  raw: unknown,
): { quantity: number; weightAllowance: number; unit?: string } => {
  const record = asRecord(raw);
  if (!record) {
    return { quantity: 0, weightAllowance: 0 };
  }
  const mapped: { quantity: number; weightAllowance: number; unit?: string } = {
    quantity: asNumber(record.quantity),
    weightAllowance: asNumber(record.weightAllowance),
  };
  if (asString(record.unit)) {
    mapped.unit = asString(record.unit);
  }
  return mapped;
};

export const mapTravinusOffer = (raw: unknown): FlightOffer | null => {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }
  const offerId = asString(record.flightSearchResultId);
  const departing = mapLeg(record.departing) ?? mapLeg(record.returning);
  if (!offerId || !departing) {
    return null;
  }

  const returningRaw = record.departing ? record.returning : null;
  const price = asRecord(record.priceInfo) ?? {};
  const baggage = asRecord(record.baggageInfo) ?? {};
  const flightMode = asString(record.flightMode, 'OneWay') === 'Return' ? 'Return' : 'OneWay';

  const departingRecord = asRecord(record.departing) ?? asRecord(record.returning);
  const departurePoint = asRecord(departingRecord?.departure);

  return {
    offerId,
    flightMode,
    currency: asString(price.currency, asString(record.currency, 'INR')),
    grandTotal: asNumber(price.grandTotal),
    adultTotal: asNumber(price.adultTotal),
    adultBase: asNumber(price.adultBase),
    adultTaxes: asNumber(price.adultTaxes),
    departing,
    returning: flightMode === 'Return' ? mapLeg(returningRaw) : null,
    baggage: {
      checkedInBags: mapBaggage(baggage.checkedInBags),
      carryOnBags: mapBaggage(baggage.carryOnBags),
    },
    adults: asNumber(record.totalAdults, 1),
    children: asNumber(record.totalChildren),
    infants: asNumber(record.totalInfants),
    source: asString(record.source, 'GDS'),
    refundable: Boolean(departurePoint?.refundable),
  };
};

export const mapTravinusSearchResults = (raw: unknown): FlightOffer[] => {
  const root = asRecord(raw);
  const data = asRecord(root?.data);
  const list = data?.flightSearchResults;
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(mapTravinusOffer).filter((offer): offer is FlightOffer => offer !== null);
};
