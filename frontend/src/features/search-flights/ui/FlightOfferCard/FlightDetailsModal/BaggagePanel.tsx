import type { BaggageAllowance } from '@best-in-flights-booking/shared-core';
import type { ReactNode } from 'react';
import { MdLuggage, MdWorkOutline } from 'react-icons/md';
import { formatBagCount, formatBagWeight } from '@shared/lib/flight-format';

const BagCard = ({
  title,
  icon,
  bag,
}: {
  title: string;
  icon: ReactNode;
  bag: BaggageAllowance;
}): JSX.Element => {
  return (
    <article className="tv-bag-card">
      <span className="tv-bag-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h3>{title}</h3>
        <p>
          {formatBagCount(bag.quantity)} included
          {bag.weightAllowance > 0 ? ` · up to ${formatBagWeight(bag.weightAllowance, bag.unit)}` : ''}
        </p>
      </div>
    </article>
  );
};

export const BaggagePanel = ({
  carryOn,
  checked,
}: {
  carryOn: BaggageAllowance;
  checked: BaggageAllowance;
}): JSX.Element => {
  return (
    <div className="tv-detail-panel tv-bag-grid">
      <BagCard title="Carry-on" icon={<MdWorkOutline className="tv-icon" aria-hidden />} bag={carryOn} />
      <BagCard title="Checked baggage" icon={<MdLuggage className="tv-icon" aria-hidden />} bag={checked} />
      <p className="muted">Allowance is per passenger. Airline rules at the airport apply.</p>
    </div>
  );
};
