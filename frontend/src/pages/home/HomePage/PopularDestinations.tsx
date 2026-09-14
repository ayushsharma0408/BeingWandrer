import { MdArrowForward } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useSitePrefs } from '@shared/i18n';
import { flightSearchPath, HOME_DESTINATIONS } from './destinations';
import { Reveal } from './Reveal';

export const PopularDestinations = (): JSX.Element => {
  const { currency, t } = useSitePrefs();
  return (
    <section className="section tv-destinations">
      <div className="wrap">
        <Reveal>
          <div className="tv-section-head">
            <div>
              <p className="tv-eyebrow">{t('dest.eyebrow')}</p>
              <h2 className="section-title">{t('dest.title')}</h2>
              <p className="muted">{t('dest.lead')}</p>
            </div>
            <Link to="/deals" className="tv-text-link">
              {t('dest.deals')} <MdArrowForward className="tv-icon" aria-hidden />
            </Link>
          </div>
        </Reveal>
        <Reveal>
          <div className="dest-grid">
            {HOME_DESTINATIONS.map((destination, index) => (
              <Link
                key={destination.route}
                to={flightSearchPath(destination.origin, destination.destination, currency)}
                className={`dest-card ${destination.tone}`}
                style={{
                  animationDelay: `${0.08 * index}s`,
                  backgroundImage: `linear-gradient(180deg, rgb(8 18 38 / 0.05) 20%, rgb(8 18 38 / 0.78) 100%), url(${destination.image})`,
                }}
              >
                <span className="dest-tag">{destination.tag}</span>
                <strong>{destination.city}</strong>
                <span className="dest-route">{destination.route}</span>
                <span className="dest-cta">
                  {t('dest.cta')} <MdArrowForward className="tv-icon" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
