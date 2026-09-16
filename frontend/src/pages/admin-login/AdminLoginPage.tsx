import { Navigate } from 'react-router-dom';
import { isStaffRole } from '@best-in-flights-booking/shared-core';
import { LoginForm } from '@features/login';
import { useAppSelector } from '@shared/store';

export const AdminLoginPage = (): JSX.Element => {
  const user = useAppSelector((state) => state.user.current);
  if (user && isStaffRole(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="auth-split admin-login">
      <div className="auth-side">
        <p className="hero-kicker">Staff access</p>
        <h2>Best in Flights operations console.</h2>
        <p>Sign in with a staff account to manage bookings, routes, offers, and customer activity.</p>
      </div>
      <div className="auth-panel">
        <div className="card stack" style={{ width: 'min(28rem, 100%)' }}>
          <h1 className="section-title">Admin sign in</h1>
          <LoginForm portal="admin" />
        </div>
      </div>
    </section>
  );
};
