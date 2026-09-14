import { useEffect, useState } from 'react';
import { MdClose, MdLogin, MdLogout, MdMenu } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { useLogout } from '@features/auth';
import { useSitePrefs } from '@shared/i18n';
import { useAppSelector } from '@shared/store';
import { AuthModal } from './AuthModal';
import { BrandLogo } from './BrandLogo';
import { HeaderNav } from './AppHeader/HeaderNav';
import { HeaderPrefs } from './AppHeader/HeaderPrefs';

export const AppHeader = (): JSX.Element => {
  const user = useAppSelector((state) => state.user.current);
  const logout = useLogout();
  const { t } = useSitePrefs();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const flightsActive =
    location.pathname === '/' || location.pathname.startsWith('/flights') || location.pathname.startsWith('/book');

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="tv-header">
        <div className="wrap tv-header-inner">
          <div className="tv-header-brand">
            <BrandLogo />
            <HeaderNav className="tv-nav" flightsActive={flightsActive} showBookings={Boolean(user)} />
          </div>
          <div className="tv-utils">
            <HeaderPrefs />
            <span className="tv-utils-split" aria-hidden="true" />
            {user ? (
              <button type="button" className="tv-signin" onClick={() => void logout()}>
                <MdLogout className="tv-icon" aria-hidden />
                {t('nav.logOut')}
              </button>
            ) : (
              <button type="button" className="tv-signin is-primary" onClick={() => setAuthOpen(true)}>
                <MdLogin className="tv-icon" aria-hidden />
                {t('nav.signIn')}
              </button>
            )}
            <button
              type="button"
              className="tv-menu-btn"
              aria-label={menuOpen ? t('auth.close') : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <MdClose className="tv-icon" aria-hidden /> : <MdMenu className="tv-icon" aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="tv-nav-drawer wrap">
            <HeaderNav
              className="tv-nav-drawer-links"
              flightsActive={flightsActive}
              showBookings={Boolean(user)}
              onNavigate={() => setMenuOpen(false)}
            />
            <HeaderPrefs className="tv-header-prefs tv-header-prefs-drawer" />
          </div>
        ) : null}
      </header>
      {authOpen ? <AuthModal onClose={() => setAuthOpen(false)} /> : null}
    </>
  );
};
