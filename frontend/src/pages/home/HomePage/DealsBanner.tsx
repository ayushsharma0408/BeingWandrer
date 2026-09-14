import { MdFlightTakeoff } from 'react-icons/md';
import { useSitePrefs } from '@shared/i18n';

export const DealsBanner = (): JSX.Element => {
  const { t } = useSitePrefs();
  return (
    <section className="section tv-banner-wrap">
      <div className="wrap">
        <div className="tv-banner">
          <div>
            <p className="tv-eyebrow">{t('banner.eyebrow')}</p>
            <h2>{t('banner.title')}</h2>
            <p>{t('banner.text')}</p>
          </div>
          <a href="#search" className="tv-banner-cta">
            <MdFlightTakeoff className="tv-icon" aria-hidden />
            {t('banner.cta')}
          </a>
        </div>
      </div>
    </section>
  );
};
