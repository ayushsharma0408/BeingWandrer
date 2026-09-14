import type { FlightEndpoint, FlightLeg, FlightSegment } from '@best-in-flights-booking/shared-core';
import {
  MdAccessTime,
  MdFlight,
  MdFlightLand,
  MdFlightTakeoff,
  MdLocationCity,
  MdLocationOn,
  MdOutlineCalendarMonth,
  MdRadioButtonUnchecked,
} from 'react-icons/md';
import { cityCountryFor, cityFor } from '@shared/lib/airport-catalog';
import {
  formatDetailDate,
  formatDetailDateTime,
  formatDuration,
  minutesBetween,
  sameCalendarDay,
  terminalLabel,
} from '@shared/lib/flight-format';
import { AirlineLogo } from '@shared/ui';

const stopsLabel = (stops: number): string => {
  if (stops === 0) {
    return 'Non-stop';
  }
  return `${stops} stop${stops > 1 ? 's' : ''}`;
};

const AirportBlock = ({
  endpoint,
  showCity,
  icon,
}: {
  endpoint: FlightEndpoint;
  showCity?: boolean;
  icon: 'pin' | 'dot';
}): JSX.Element => {
  const terminal = terminalLabel(endpoint.terminal);
  return (
    <div className="tv-itin-place">
      <span className="tv-itin-line">
        {icon === 'pin' ? <MdLocationOn className="tv-itin-ico" aria-hidden /> : <MdRadioButtonUnchecked className="tv-itin-ico" aria-hidden />}
        <span>
          {endpoint.airportName} ({endpoint.iataCode})
        </span>
      </span>
      {showCity ? (
        <span className="tv-itin-line tv-itin-sub">
          <MdLocationCity className="tv-itin-ico" aria-hidden />
          <span>{cityCountryFor(endpoint.iataCode)}</span>
        </span>
      ) : null}
      {terminal ? <span className="tv-itin-terminal">Terminal {terminal}</span> : null}
    </div>
  );
};

const SegmentBlock = ({
  segment,
  nextDayWarning,
}: {
  segment: FlightSegment;
  nextDayWarning?: boolean;
}): JSX.Element => {
  const carrierCode = segment.departure.carrierCode;
  const carrierName = segment.departure.carrierName;
  const flightCode = `${carrierCode} ${segment.flightNumber}`.trim();
  const aircraft = segment.departure.aircraftName ?? segment.arrival.aircraftName;

  return (
    <article className="tv-itin-segment">
      <div className="tv-itin-rail" aria-hidden>
        <MdFlightTakeoff className="tv-itin-rail-icon" />
        <span className="tv-itin-rail-line" />
        <AirlineLogo code={carrierCode} name={carrierName} className="tv-itin-rail-logo" />
        <span className="tv-itin-rail-line" />
        <MdFlightLand className="tv-itin-rail-icon" />
      </div>
      <div className="tv-itin-body">
        <div className="tv-itin-when">
          <span className="tv-itin-line">
            <MdOutlineCalendarMonth className="tv-itin-ico" aria-hidden />
            <strong>{formatDetailDateTime(segment.departure.at)}</strong>
          </span>
          {nextDayWarning ? <span className="tv-itin-alert">You will depart the next day</span> : null}
        </div>
        <AirportBlock endpoint={segment.departure} icon="pin" />

        <div className="tv-itin-flight">
          <span className="tv-itin-line">
            <MdFlight className="tv-itin-ico" aria-hidden />
            <strong>
              {formatDuration(segment.duration)} • {carrierName}
            </strong>
          </span>
          <span className="tv-itin-sub">
            {[aircraft, flightCode].filter(Boolean).join(' • ')}
          </span>
        </div>

        <div className="tv-itin-when">
          <span className="tv-itin-line">
            <MdOutlineCalendarMonth className="tv-itin-ico" aria-hidden />
            <strong>{formatDetailDateTime(segment.arrival.at)}</strong>
          </span>
        </div>
        <AirportBlock endpoint={segment.arrival} showCity icon="dot" />
      </div>
    </article>
  );
};

const LayoverBlock = ({
  airportName,
  fromIso,
  toIso,
}: {
  airportName: string;
  fromIso: string;
  toIso: string;
}): JSX.Element => {
  const minutes = minutesBetween(fromIso, toIso);
  const overnight = !sameCalendarDay(fromIso, toIso);
  const label = minutes > 0 ? formatDuration(`${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`) : '';

  return (
    <div className="tv-itin-layover">
      <div className="tv-itin-rail tv-itin-rail-layover" aria-hidden>
        <span className="tv-itin-rail-dash" />
        <MdAccessTime className="tv-itin-rail-icon" />
        <span className="tv-itin-rail-dash" />
      </div>
      <div className="tv-itin-layover-copy">
        <span>
          {label ? `${label} layover at ${airportName}` : `Layover at ${airportName}`}
        </span>
        {overnight ? <span className="tv-itin-alert">Overnight layover</span> : null}
      </div>
    </div>
  );
};

export const Timeline = ({ title, leg }: { title: string; leg: FlightLeg }): JSX.Element => {
  const segments = leg.segments.length > 0 ? leg.segments : [{
    duration: leg.duration,
    departure: leg.departure,
    arrival: leg.arrival,
    flightNumber: leg.flightNumber,
  }];

  return (
    <section className="tv-timeline">
      <div className="tv-timeline-title">
        <h3>
          {title} • {formatDetailDate(leg.departure.at)}
        </h3>
        <span className="muted">
          {stopsLabel(leg.numberOfStops)} • {formatDuration(leg.duration)}
        </span>
      </div>
      <div className="tv-itin">
        {segments.map((segment, index) => {
          const previous = index > 0 ? segments[index - 1] : null;
          const nextDayWarning = previous ? !sameCalendarDay(previous.arrival.at, segment.departure.at) : false;
          return (
            <div key={`${segment.flightNumber}-${segment.departure.at}-${index}`}>
              {previous ? (
                <LayoverBlock
                  airportName={previous.arrival.airportName || cityFor(previous.arrival.iataCode)}
                  fromIso={previous.arrival.at}
                  toIso={segment.departure.at}
                />
              ) : null}
              <SegmentBlock segment={segment} nextDayWarning={nextDayWarning} />
            </div>
          );
        })}
      </div>
    </section>
  );
};
