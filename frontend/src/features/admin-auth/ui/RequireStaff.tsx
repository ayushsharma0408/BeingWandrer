import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isStaffRole } from '@best-in-flights-booking/shared-core';
import { useAppSelector } from '@shared/store';

interface RequireStaffProps {
  children: ReactNode;
}

export const RequireStaff = ({ children }: RequireStaffProps): JSX.Element => {
  const user = useAppSelector((state) => state.user.current);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login/admin" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!isStaffRole(user.role)) {
    return <Navigate to="/login/admin" replace />;
  }

  return <>{children}</>;
};
