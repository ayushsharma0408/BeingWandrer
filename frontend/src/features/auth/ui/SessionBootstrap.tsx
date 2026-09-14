import type { ReactNode } from 'react';
import { useSessionRestore } from '../model/use-session-restore';

interface SessionBootstrapProps {
  children: ReactNode;
}

export const SessionBootstrap = ({ children }: SessionBootstrapProps): JSX.Element => {
  const { isRestoring } = useSessionRestore();

  if (isRestoring) {
    return (
      <div className="hero" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p>Preparing your booking session…</p>
      </div>
    );
  }

  return <>{children}</>;
};
