import { Link } from 'react-router-dom';
import { POPULAR_ROUTES } from '@shared/constants/airports';

const tomorrow = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export const DealsPage = (): JSX.Element => {
  return (
    <div className="page-shell">
      <div className="wrap stack">
        <h1 className="section-title">Deals</h1>
        <p className="muted">Jump into popular routes with tomorrow’s date. Fares refresh from Travinus.</p>
        <div className="dest-grid">
          {POPULAR_ROUTES.map((route) => (
            <Link
              key={route.label}
              className={`dest-card ${route.tone}`}
              to={`/flights?origin=${route.origin}&destination=${route.destination}&departureDate=${tomorrow()}&adults=1&children=0&infants=0&travelClass=Economy&flightMode=OneWay`}
            >
              <strong>{route.label}</strong>
              <span>Search live fares</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
