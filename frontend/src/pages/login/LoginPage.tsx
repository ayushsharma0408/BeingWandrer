import { Link } from 'react-router-dom';
import { LoginForm } from '@features/login';

export const LoginPage = (): JSX.Element => {
  return (
    <section className="auth-split">
      <div className="auth-side">
        <p className="hero-kicker">Welcome back</p>
        <h2>Your trips, fares, and bookings in one place.</h2>
        <p>Sign in to save trips. Checkout does not require an account.</p>
      </div>
      <div className="auth-panel">
        <div className="card stack" style={{ width: 'min(28rem, 100%)' }}>
          <h1 className="section-title">Sign in</h1>
          <LoginForm />
          <p className="muted">
            New traveller? <Link to="/register">Create a free account</Link>
          </p>
        </div>
      </div>
    </section>
  );
};
