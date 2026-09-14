import { useEffect, useState } from 'react';
import { FilterSkeleton } from './FilterSkeleton';
import { OfferSkeleton } from './OfferSkeleton';
import { SearchingPanel } from './SearchingPanel';

interface SearchLoadingProps {
  origin: string;
  destination: string;
}

export const SearchLoading = ({ origin, destination }: SearchLoadingProps): JSX.Element => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="wrap tv-results-body" aria-busy="true" aria-live="polite">
      <FilterSkeleton />
      <div className="stack">
        <SearchingPanel origin={origin} destination={destination} tick={tick} />
        <OfferSkeleton />
        <OfferSkeleton />
        <OfferSkeleton />
      </div>
    </div>
  );
};
