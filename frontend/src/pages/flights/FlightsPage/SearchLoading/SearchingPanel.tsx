import { MdFlight, MdFlightLand, MdFlightTakeoff } from 'react-icons/md';
import { cityFor } from '@shared/constants/airports';
import { useSitePrefs } from '@shared/i18n';

interface SearchingPanelProps {
  origin: string;
  destination: string;
  tick: number;
}

export const SearchingPanel = ({ origin, destination, tick }: SearchingPanelProps): JSX.Element => {
  const { t } = useSitePrefs();
  const originCode = origin.toUpperCase();
  const destinationCode = destination.toUpperCase();
  const statusLines = [t('search.statusFares'), t('search.statusCompare'), t('search.statusCabin')];

  return (
    <section
      className="tv-searching"
      aria-label={`${t('search.finding')} ${originCode} ${destinationCode}`}
    >
      <p className="tv-searching-kicker">{t('search.finding')}</p>
      <div className="tv-searching-route">
        <div className="tv-searching-city">
          <MdFlightTakeoff className="tv-icon" aria-hidden />
          <div>
            <strong>{originCode}</strong>
            <span>{cityFor(origin)}</span>
          </div>
        </div>
        <div className="tv-searching-path">
          <span className="tv-searching-pulse" />
          <span className="tv-searching-track" />
          <MdFlight className="tv-searching-plane" aria-hidden />
          <span className="tv-searching-pulse tv-searching-pulse-end" />
        </div>
        <div className="tv-searching-city tv-searching-end">
          <div>
            <strong>{destinationCode}</strong>
            <span>{cityFor(destination)}</span>
          </div>
          <MdFlightLand className="tv-icon" aria-hidden />
        </div>
      </div>
      <div className="tv-searching-bar" aria-hidden="true">
        <span />
      </div>
      <p key={tick} className="tv-searching-status">
        {statusLines[tick % statusLines.length]}
        <span className="tv-searching-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
    </section>
  );
};
