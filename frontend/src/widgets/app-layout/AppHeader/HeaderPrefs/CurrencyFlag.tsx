import type { CurrencyCode } from '@shared/i18n';
import type { ReactNode } from 'react';

interface CurrencyFlagProps {
  code: CurrencyCode;
}

const FlagFrame = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <svg className="tv-flag" viewBox="0 0 20 14" aria-hidden="true">
      {children}
    </svg>
  );
};

export const CurrencyFlag = ({ code }: CurrencyFlagProps): JSX.Element => {
  if (code === 'USD') {
    return (
      <FlagFrame>
        <rect width="20" height="14" fill="#b22234" />
        <rect y="1.08" width="20" height="1.08" fill="#fff" />
        <rect y="3.24" width="20" height="1.08" fill="#fff" />
        <rect y="5.4" width="20" height="1.08" fill="#fff" />
        <rect y="7.56" width="20" height="1.08" fill="#fff" />
        <rect y="9.72" width="20" height="1.08" fill="#fff" />
        <rect y="11.88" width="20" height="1.08" fill="#fff" />
        <rect width="8.4" height="7.5" fill="#3c3b6e" />
      </FlagFrame>
    );
  }
  if (code === 'CAD') {
    return (
      <FlagFrame>
        <rect width="20" height="14" fill="#fff" />
        <rect width="5.2" height="14" fill="#d52b1e" />
        <rect x="14.8" width="5.2" height="14" fill="#d52b1e" />
        <path fill="#d52b1e" d="M10 3.1 11.1 6l3 .1-2.4 1.8.9 2.8L10 9.1 7.4 10.7l.9-2.8L5.9 6.1l3-.1z" />
      </FlagFrame>
    );
  }
  if (code === 'EUR') {
    const stars = Array.from({ length: 12 }, (_, index) => {
      const angle = (index * Math.PI * 2) / 12 - Math.PI / 2;
      return { x: 10 + Math.cos(angle) * 4.1, y: 7 + Math.sin(angle) * 3.4 };
    });
    return (
      <FlagFrame>
        <rect width="20" height="14" fill="#003399" />
        {stars.map((star) => (
          <circle key={`${star.x}-${star.y}`} cx={star.x} cy={star.y} r="0.55" fill="#ffcc00" />
        ))}
      </FlagFrame>
    );
  }
  if (code === 'GBP') {
    return (
      <FlagFrame>
        <rect width="20" height="14" fill="#012169" />
        <path fill="#fff" d="M0 0 20 14M20 0 0 14" stroke="#fff" strokeWidth="2.4" />
        <path fill="none" stroke="#c8102e" strokeWidth="1.2" d="M0 0 20 14M20 0 0 14" />
        <path fill="#fff" d="M8.4 0h3.2v14H8.4zM0 5.3h20v3.4H0z" />
        <path fill="#c8102e" d="M9 0h2v14H9zM0 6h20v2H0z" />
      </FlagFrame>
    );
  }
  if (code === 'JPY') {
    return (
      <FlagFrame>
        <rect width="20" height="14" fill="#fff" />
        <circle cx="10" cy="7" r="3.4" fill="#bc002d" />
      </FlagFrame>
    );
  }
  return (
    <FlagFrame>
      <rect width="20" height="4.66" fill="#ff9933" />
      <rect y="4.66" width="20" height="4.68" fill="#fff" />
      <rect y="9.34" width="20" height="4.66" fill="#138808" />
      <circle cx="10" cy="7" r="1.45" fill="none" stroke="#000080" strokeWidth="0.45" />
    </FlagFrame>
  );
};
