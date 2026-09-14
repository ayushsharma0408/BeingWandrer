import { Link } from 'react-router-dom';

interface BrandLogoProps {
  onDark?: boolean;
}

export const BrandLogo = ({ onDark = false }: BrandLogoProps): JSX.Element => {
  return (
    <Link to="/" className={onDark ? 'tv-logo tv-logo-on-dark' : 'tv-logo'} aria-label="BeingWandrer">
      <img
        className="tv-logo-img"
        src="/brand/beingwandrer-logo-cropped.png"
        alt="BeingWandrer"
        width={749}
        height={262}
      />
    </Link>
  );
};
