import { MdFlight, MdLock, MdSupportAgent, MdTrendingUp } from 'react-icons/md';
import { FlightSearchForm } from '@features/search-flights';
import { useSitePrefs } from '@shared/i18n';

export const Hero = (): JSX.Element => {
  const { t } = useSitePrefs();
  return (
    <section className="tv-hero">
      <div className="tv-hero-sky" aria-hidden="true">
        <span className="tv-cloud tv-cloud-a" />
        <span className="tv-cloud tv-cloud-b" />
        <span className="tv-cloud tv-cloud-c" />
        <MdFlight className="tv-hero-plane" />
      </div>
      <div className="wrap tv-hero-inner">
        <p className="tv-hero-kicker">{t('hero.kicker')}</p>
        <h1>{t('hero.title')}</h1>
        <p className="tv-hero-lead">{t('hero.lead')}</p>
        <ul className="tv-hero-pills">
          <li>
            <MdTrendingUp className="tv-icon" aria-hidden /> {t('hero.live')}
          </li>
          <li>
            <MdLock className="tv-icon" aria-hidden /> {t('hero.secure')}
          </li>
          <li>
            <MdSupportAgent className="tv-icon" aria-hidden /> {t('hero.help')}
          </li>
        </ul>
        <div className="tv-cats">
          <span className="is-active">
            <MdFlight className="tv-icon" aria-hidden />
            {t('nav.flights')}
          </span>
        </div>
        <div className="tv-search-wrap" id="search">
          <FlightSearchForm />
        </div>
      </div>
    </section>
  );
};
