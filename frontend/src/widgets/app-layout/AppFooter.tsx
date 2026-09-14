import { Link } from 'react-router-dom';
import { useSitePrefs } from '@shared/i18n';
import { BrandLogo } from './BrandLogo';

export const AppFooter = (): JSX.Element => {
  const { t } = useSitePrefs();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <BrandLogo onDark />
            <p>{t('footer.blurb')}</p>
          </div>
          <div>
            <h4>{t('footer.travel')}</h4>
            <p>
              <Link to="/">{t('footer.searchFlights')}</Link>
            </p>
            <p>
              <Link to="/flights">{t('footer.offers')}</Link>
            </p>
            <p>
              <Link to="/about">{t('footer.about')}</Link>
            </p>
            <p>
              <Link to="/faqs">{t('footer.faqs')}</Link>
            </p>
          </div>
        
          <div>
            <h4>{t('footer.support')}</h4>
            <p>{t('footer.help')}</p>
            <p>{t('footer.secure')}</p>
            <p>{t('footer.refresh')}</p>
          </div>
        </div>
        <p className="footer-note">© {new Date().getFullYear()} Best in Flights Booking.</p>
      </div>
    </footer>
  );
};
