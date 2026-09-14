import { formatDuration, formatMoney } from '@shared/lib/flight-format';
import type { SortKey } from '../../model/filter-offers';

interface SortTabsProps {
  value: SortKey;
  currency: string;
  summaries: Record<SortKey, { price: number; minutes: number } | null>;
  onChange: (value: SortKey) => void;
}

const TABS: SortKey[] = ['cheapest', 'best', 'fastest'];

export const SortTabs = ({ value, currency, summaries, onChange }: SortTabsProps): JSX.Element => {
  return (
    <div className="tv-sort">
      {TABS.map((tab) => {
        const summary = summaries[tab];
        return (
          <button key={tab} type="button" className={value === tab ? 'is-active' : ''} onClick={() => onChange(tab)}>
            <strong>{tab === 'cheapest' ? 'Cheapest' : tab === 'best' ? 'Best' : 'Fastest'}</strong>
            {summary ? (
              <span>
                {formatMoney(currency, summary.price)} · {formatDuration(`${Math.floor(summary.minutes / 60)}:${String(summary.minutes % 60).padStart(2, '0')}`)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
