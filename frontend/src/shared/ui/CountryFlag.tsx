import { useState } from 'react';
import { countryFlagEmoji, countryFlagSrc } from '@shared/lib/country-codes';

interface CountryFlagProps {
  iso: string;
  name: string;
}

export const CountryFlag = ({ iso, name }: CountryFlagProps): JSX.Element => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="country-code-emoji" aria-hidden>
        {countryFlagEmoji(iso)}
      </span>
    );
  }
  return (
    <img
      className="country-code-flag"
      src={countryFlagSrc(iso)}
      alt=""
      title={name}
      width={20}
      height={15}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};
