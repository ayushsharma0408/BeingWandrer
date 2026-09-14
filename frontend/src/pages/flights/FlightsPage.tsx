import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { searchFlightsApi, type FlightSearchParams } from '@entities/flight-offer';
import { PriceAlertModal } from '@features/price-alerts';
import {
  FlightOfferCard,
  FlightSearchForm,
  FilterSidebar,
  SortTabs,
  applyFlightFilters,
  emptyFilters,
  filterBounds,
  sortSummaries,
  type FlightFiltersState,
  type FlightSearchFormValues,
  type SortKey,
} from '@features/search-flights';
import { ApiClientError } from '@shared/api';
import { parseCurrencyCode, useSitePrefs } from '@shared/i18n';
import { SearchLoading } from './FlightsPage/SearchLoading';

const readParams = (searchParams: URLSearchParams, fallbackCurrency: string): FlightSearchParams | null => {
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  if (!origin || !destination || !departureDate) {
    return null;
  }
  return {
    origin,
    destination,
    departureDate,
    returnDate: searchParams.get('returnDate') ?? undefined,
    adults: Number(searchParams.get('adults') ?? 1),
    children: Number(searchParams.get('children') ?? 0),
    infants: Number(searchParams.get('infants') ?? 0),
    currency: parseCurrencyCode(searchParams.get('currency')) ?? fallbackCurrency,
    travelClass: searchParams.get('travelClass') ?? 'Economy',
    flightMode: searchParams.get('flightMode') === 'Return' ? 'Return' : 'OneWay',
    page: Number(searchParams.get('page') ?? 1),
  };
};

export const FlightsPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const { currency: preferredCurrency, t } = useSitePrefs();
  const params = useMemo(
    () => readParams(searchParams, preferredCurrency),
    [searchParams, preferredCurrency],
  );
  const query = useQuery({
    queryKey: ['flights', params],
    queryFn: () => searchFlightsApi({ ...(params as FlightSearchParams), limit: 500 }),
    enabled: Boolean(params),
  });
  const offers = query.data?.offers ?? [];
  const searchKey = searchParams.toString();
  const resultKey = `${searchKey}::${offers.map((offer) => offer.offerId).join('|')}`;
  const currency = offers[0]?.currency ?? params?.currency ?? 'INR';
  const [sort, setSort] = useState<SortKey>('cheapest');
  const [filters, setFilters] = useState<FlightFiltersState>(emptyFilters([]));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSaved, setAlertSaved] = useState(false);
  const bounds = useMemo(() => filterBounds(offers), [offers]);

  useEffect(() => {
    setSort('cheapest');
    setFilters(emptyFilters(offers));
    setFiltersOpen(false);
    setAlertOpen(false);
    setAlertSaved(false);
  }, [resultKey]);

  useEffect(() => {
    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    html.style.overflow = filtersOpen ? 'hidden' : '';
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [filtersOpen]);

  const activeFilters = filters.maxPrice === 0 ? emptyFilters(offers) : filters;
  const visible = applyFlightFilters(offers, activeFilters, sort);
  const summaries = sortSummaries(offers);
  const cheapestId = applyFlightFilters(offers, emptyFilters(offers), 'cheapest')[0]?.offerId;
  const fastestId = applyFlightFilters(offers, emptyFilters(offers), 'fastest')[0]?.offerId;
  const bestId = applyFlightFilters(offers, emptyFilters(offers), 'best')[0]?.offerId;

  return (
    <div className="tv-results">
      <FlightSearchForm
        key={searchParams.toString()}
        variant="compact"
        initialValues={
          params
            ? {
                origin: params.origin,
                destination: params.destination,
                departureDate: params.departureDate,
                returnDate: params.returnDate,
                adults: params.adults,
                children: params.children,
                infants: params.infants,
                travelClass: params.travelClass as FlightSearchFormValues['travelClass'],
                flightMode: params.flightMode,
              }
            : undefined
        }
      />
      {query.isLoading && params ? (
        <SearchLoading origin={params.origin} destination={params.destination} />
      ) : (
        <div className="wrap tv-results-body">
          {query.data ? (
            <>
              {filtersOpen ? (
                <button
                  type="button"
                  className="tv-filters-backdrop"
                  aria-label="Close filters"
                  onClick={() => setFiltersOpen(false)}
                />
              ) : null}
              <FilterSidebar
                offers={offers}
                bounds={bounds}
                currency={currency}
                filters={activeFilters}
                onChange={setFilters}
                onReset={() => setFilters(emptyFilters(offers))}
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
              />
            </>
          ) : (
            <aside className="tv-filters tv-filters-placeholder">
              <p className="muted">{t('search.filtersLater')}</p>
            </aside>
          )}
          <div className="stack">
            {!params ? (
              <div className="card stack">
                <h2 className="checkout-card-title">{t('search.chooseRoute')}</h2>
                <p className="muted">{t('search.chooseRouteHint')}</p>
              </div>
            ) : null}
            {query.error ? (
              <p className="field-error">
                {query.error instanceof ApiClientError
                  ? query.error.message
                  : query.error instanceof Error
                    ? query.error.message
                    : 'Search failed'}
              </p>
            ) : null}
            {query.data ? (
              <>
                <div className="tv-results-head">
                  <p>Showing {visible.length} flight recommendations</p>
                  <div className="tv-results-head-actions">
                    <button type="button" className="tv-filters-toggle" onClick={() => setFiltersOpen(true)}>
                      Filters
                    </button>
                    <button
                      type="button"
                      className={alertSaved ? 'tv-alert is-set' : 'tv-alert'}
                      disabled={!summaries.cheapest}
                      onClick={() => setAlertOpen(true)}
                    >
                      {alertSaved ? 'Alert set' : 'Get Price Alerts'}
                    </button>
                  </div>
                </div>
                <SortTabs value={sort} currency={currency} summaries={summaries} onChange={setSort} />
              </>
            ) : null}
            {visible.map((offer) => {
              const badges: Array<'Low fare' | 'Best' | 'Fastest'> = [];
              if (offer.offerId === cheapestId) {
                badges.push('Low fare');
              }
              if (offer.offerId === bestId) {
                badges.push('Best');
              }
              if (offer.offerId === fastestId) {
                badges.push('Fastest');
              }
              return <FlightOfferCard key={offer.offerId} offer={offer} badges={badges} />;
            })}
          </div>
        </div>
      )}
      {alertOpen && params && summaries.cheapest ? (
        <PriceAlertModal
          route={{
            origin: params.origin,
            destination: params.destination,
            departureDate: params.departureDate,
            returnDate: params.returnDate,
            flightMode: params.flightMode,
            currency,
            currentPrice: summaries.cheapest.price,
          }}
          onClose={() => setAlertOpen(false)}
          onSaved={() => setAlertSaved(true)}
        />
      ) : null}
    </div>
  );
};
