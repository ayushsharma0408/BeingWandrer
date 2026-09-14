import { useLayoutEffect, useRef } from 'react';
import type { FlightOffer } from '@best-in-flights-booking/shared-core';
import { formatDuration, formatMoney } from '@shared/lib/flight-format';
import { AirlineLogo } from '@shared/ui';
import type { FilterBounds, FlightFiltersState } from '../../model/filter-offers';
import { lowestPriceFor } from '../../model/filter-offers';

interface FilterSidebarProps {
  offers: FlightOffer[];
  bounds: FilterBounds;
  currency: string;
  filters: FlightFiltersState;
  onChange: (next: FlightFiltersState) => void;
  onReset: () => void;
  open?: boolean;
  onClose?: () => void;
}

const minutesLabel = (minutes: number): string => {
  return formatDuration(`${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`);
};

export const FilterSidebar = ({
  offers,
  bounds,
  currency,
  filters,
  onChange,
  onReset,
  open = false,
  onClose,
}: FilterSidebarProps): JSX.Element => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nonStop = lowestPriceFor(offers, (offer) => offer.departing.numberOfStops === 0);
  const oneStop = lowestPriceFor(offers, (offer) => offer.departing.numberOfStops === 1);
  const twoStop = lowestPriceFor(offers, (offer) => offer.departing.numberOfStops >= 2);
  const airlines = [...new Set(offers.map((offer) => offer.departing.departure.carrierName))].sort();
  const priceMax = Math.max(bounds.maxPrice, bounds.minPrice + 1);
  const durationMax = Math.max(bounds.maxDuration, bounds.minDuration + 1);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return undefined;
    }

    const syncHeight = (): void => {
      if (window.matchMedia('(max-width: 960px)').matches) {
        el.style.maxHeight = '';
        return;
      }
      const top = el.getBoundingClientRect().top;
      el.style.maxHeight = `${Math.max(160, window.innerHeight - top - 24)}px`;
    };

    const onWheel = (event: WheelEvent): void => {
      if (el.scrollHeight <= el.clientHeight + 1) {
        return;
      }
      const atTop = el.scrollTop <= 0 && event.deltaY < 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && event.deltaY > 0;
      if (atTop || atBottom) {
        return;
      }
      el.scrollTop += event.deltaY;
      event.preventDefault();
      event.stopPropagation();
    };

    syncHeight();
    window.addEventListener('scroll', syncHeight, { passive: true });
    window.addEventListener('resize', syncHeight);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('scroll', syncHeight);
      window.removeEventListener('resize', syncHeight);
      el.removeEventListener('wheel', onWheel);
    };
  }, [offers.length, open]);

  const toggleStop = (value: number): void => {
    const next = filters.stops.includes(value)
      ? filters.stops.filter((stop) => stop !== value)
      : [...filters.stops, value];
    onChange({ ...filters, stops: next });
  };

  const toggleAirline = (name: string): void => {
    const next = filters.airlines.includes(name)
      ? filters.airlines.filter((airline) => airline !== name)
      : [...filters.airlines, name];
    onChange({ ...filters, airlines: next });
  };

  return (
    <aside className={open ? 'tv-filters is-open' : 'tv-filters'}>
      <div className="tv-filters-sheet-head">
        <strong>Filters</strong>
        {onClose ? (
          <button type="button" className="tv-filters-close" aria-label="Close filters" onClick={onClose}>
            ×
          </button>
        ) : null}
      </div>
      <div ref={scrollRef} className="tv-filters-scroll">
        <button type="button" className="tv-reset" onClick={onReset}>
          Reset Filters
        </button>
        <section className="tv-filter-card">
          <h3>Stops</h3>
          {[
            { value: 0, label: 'Non-Stop', price: nonStop },
            { value: 1, label: '1 Stop', price: oneStop },
            { value: 2, label: '2+ Stops', price: twoStop },
          ].map((option) =>
            option.price === null ? null : (
              <label key={option.value} className="tv-filter-row">
                <span>
                  <input
                    type="checkbox"
                    checked={filters.stops.includes(option.value)}
                    onChange={() => toggleStop(option.value)}
                  />{' '}
                  {option.label}
                </span>
                <span>{formatMoney(currency, option.price)}</span>
              </label>
            ),
          )}
        </section>
        <section className="tv-filter-card">
          <h3>Airlines</h3>
          {airlines.map((airline) => {
            const price = lowestPriceFor(offers, (offer) => offer.departing.departure.carrierName === airline);
            const code = offers.find((offer) => offer.departing.departure.carrierName === airline)?.departing.departure
              .carrierCode;
            return (
              <label key={airline} className="tv-filter-row">
                <span>
                  <input type="checkbox" checked={filters.airlines.includes(airline)} onChange={() => toggleAirline(airline)} />{' '}
                  <AirlineLogo className="tv-airline-logo-sm" code={code} name={airline} />
                  {airline}
                </span>
                <span>{price ? formatMoney(currency, price) : '—'}</span>
              </label>
            );
          })}
        </section>
        <section className="tv-filter-card">
          <h3>Price Range</h3>
          <p className="muted">
            {formatMoney(currency, bounds.minPrice)} – {formatMoney(currency, filters.maxPrice)}
          </p>
          <input
            type="range"
            min={Math.floor(bounds.minPrice)}
            max={Math.ceil(priceMax)}
            value={Math.min(filters.maxPrice, priceMax)}
            disabled={bounds.maxPrice <= bounds.minPrice}
            onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })}
          />
        </section>
        <section className="tv-filter-card">
          <h3>Trip Duration</h3>
          <p className="muted">
            {minutesLabel(bounds.minDuration)} – {minutesLabel(filters.maxDuration)}
          </p>
          <input
            type="range"
            min={bounds.minDuration}
            max={durationMax}
            value={Math.min(filters.maxDuration, durationMax)}
            disabled={bounds.maxDuration <= bounds.minDuration}
            onChange={(event) => onChange({ ...filters, maxDuration: Number(event.target.value) })}
          />
        </section>
        <section className="tv-filter-card">
          <h3>Departing Flight</h3>
          <p className="muted">
            Take-off {Math.floor(filters.departFrom)}:00 – {Math.floor(filters.departTo)}:00
          </p>
          <input
            type="range"
            min={0}
            max={24}
            value={filters.departTo}
            onChange={(event) => onChange({ ...filters, departTo: Number(event.target.value) })}
          />
        </section>
        <section className="tv-filter-card">
          <h3>Bags</h3>
          <label className="tv-filter-row">
            <span>
              <input
                type="checkbox"
                checked={filters.carryOnOnly}
                onChange={(event) => onChange({ ...filters, carryOnOnly: event.target.checked })}
              />{' '}
              1 Carry-On Bag
            </span>
          </label>
          <label className="tv-filter-row">
            <span>
              <input
                type="checkbox"
                checked={filters.checkedBagOnly}
                onChange={(event) => onChange({ ...filters, checkedBagOnly: event.target.checked })}
              />{' '}
              1 Check-In Bag
            </span>
          </label>
        </section>
      </div>
    </aside>
  );
};
