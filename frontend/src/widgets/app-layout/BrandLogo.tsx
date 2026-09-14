import { Link } from 'react-router-dom';

interface BrandLogoProps {
  onDark?: boolean;
}

export const BrandLogo = ({ onDark = false }: BrandLogoProps): JSX.Element => {
  return (
    <Link to="/" className={onDark ? 'tv-logo tv-logo-on-dark' : 'tv-logo'} aria-label="Best in Flights">
      <img
        className="tv-logo-img"
        src="/brand/best-in-flights-logo.png"
        alt="Best in Flights"
        width={220}
        height={46}
      />
    </Link>
  );
};
