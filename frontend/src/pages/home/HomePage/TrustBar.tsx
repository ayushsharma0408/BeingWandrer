import { MdBolt, MdLock, MdSupportAgent, MdTravelExplore } from 'react-icons/md';
import { useSitePrefs } from '@shared/i18n';

export const TrustBar = (): JSX.Element => {
  const { t } = useSitePrefs();
  const items = [
    { icon: MdTravelExplore, title: t('trust.routes.title'), text: t('trust.routes.text') },
    { icon: MdBolt, title: t('trust.fares.title'), text: t('trust.fares.text') },
    { icon: MdLock, title: t('trust.session.title'), text: t('trust.session.text') },
    { icon: MdSupportAgent, title: t('trust.help.title'), text: t('trust.help.text') },
  ];

  return (
    <section className="tv-trust">
      <div className="wrap tv-trust-grid">
        {items.map((item) => (
          <article key={item.title} className="tv-trust-item">
            <span className="tv-trust-icon">
              <item.icon className="tv-icon" aria-hidden />
            </span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
