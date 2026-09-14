import { useEffect, useState } from 'react';
import { airlineIconFor, isAirlineCatalogReady, preloadAirlineCatalog } from '@shared/lib/airline-catalog';
import { airlineInitials, airlineSwatch } from '@shared/lib/flight-format';
import { cn } from '@shared/lib/cn';

interface AirlineLogoProps {
  name: string;
  code?: string;
  className?: string;
}

export const AirlineLogo = ({ name, code, className }: AirlineLogoProps): JSX.Element => {
  const [ready, setReady] = useState(isAirlineCatalogReady);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready) {
      return;
    }
    void preloadAirlineCatalog().then(() => setReady(true));
  }, [ready]);

  const icon = ready ? airlineIconFor(code, name) : undefined;
  if (!icon || failed) {
    return (
      <span className={cn('tv-airline-mark', className)} style={{ background: airlineSwatch(name) }}>
        {airlineInitials(name)}
      </span>
    );
  }

  return (
    <img
      className={cn('tv-airline-logo', className)}
      src={icon.image}
      alt=""
      title={name}
      onError={() => setFailed(true)}
    />
  );
};
