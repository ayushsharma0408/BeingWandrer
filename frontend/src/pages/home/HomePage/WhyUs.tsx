import { MdBolt, MdLock, MdPayments } from 'react-icons/md';
import { useSitePrefs } from '@shared/i18n';
import { Reveal } from './Reveal';

export const WhyUs = (): JSX.Element => {
  const { t } = useSitePrefs();
  const items = [
    { icon: MdBolt, title: t('why.live.title'), text: t('why.live.text') },
    { icon: MdPayments, title: t('why.checkout.title'), text: t('why.checkout.text') },
    { icon: MdLock, title: t('why.secure.title'), text: t('why.secure.text') },
  ];

  return (
    <section className="section tv-why">
      <div className="wrap">
        <Reveal>
          <p className="tv-eyebrow">{t('why.eyebrow')}</p>
          <h2 className="section-title">{t('why.title')}</h2>
        </Reveal>
        <div className="why-grid">
          {items.map((item, index) => (
            <Reveal key={item.title}>
              <article className="card why-card" style={{ animationDelay: `${0.08 * index}s` }}>
                <span className="why-icon">
                  <item.icon className="tv-icon" aria-hidden />
                </span>
                <h3>{item.title}</h3>
                <p className="muted">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
