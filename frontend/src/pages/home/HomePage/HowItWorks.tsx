import { MdCreditCard, MdSearch, MdVerified } from 'react-icons/md';
import { useSitePrefs } from '@shared/i18n';
import { Reveal } from './Reveal';

export const HowItWorks = (): JSX.Element => {
  const { t } = useSitePrefs();
  const steps = [
    { icon: MdSearch, title: t('how.search.title'), text: t('how.search.text') },
    { icon: MdVerified, title: t('how.compare.title'), text: t('how.compare.text') },
    { icon: MdCreditCard, title: t('how.book.title'), text: t('how.book.text') },
  ];

  return (
    <section className="section tv-how">
      <div className="wrap">
        <Reveal>
          <p className="tv-eyebrow">{t('how.eyebrow')}</p>
          <h2 className="section-title">{t('how.title')}</h2>
        </Reveal>
        <div className="tv-how-grid">
          {steps.map((step, index) => (
            <Reveal key={step.title}>
              <article className="tv-how-card" style={{ animationDelay: `${0.1 * index}s` }}>
                <span className="tv-how-num">{index + 1}</span>
                <span className="tv-how-icon">
                  <step.icon className="tv-icon" aria-hidden />
                </span>
                <h3>{step.title}</h3>
                <p className="muted">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
