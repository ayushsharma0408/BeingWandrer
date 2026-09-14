import { MdFlight } from 'react-icons/md';
import { NavLink } from 'react-router-dom';
import { useSitePrefs } from '@shared/i18n';

interface HeaderNavProps {
  className: string;
  flightsActive: boolean;
  showBookings: boolean;
  onNavigate?: () => void;
}

export const HeaderNav = ({ className, flightsActive, showBookings, onNavigate }: HeaderNavProps): JSX.Element => {
  const { t } = useSitePrefs();
  return (
    <nav className={className}>
      <NavLink to="/" className={flightsActive ? 'is-active' : ''} onClick={onNavigate}>
        <MdFlight className="tv-icon" aria-hidden />
        {t('nav.flights')}
      </NavLink>
      {showBookings ? (
        <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'is-active' : '')} onClick={onNavigate}>
          {t('nav.bookings')}
        </NavLink>
      ) : null}
    </nav>
  );
};
