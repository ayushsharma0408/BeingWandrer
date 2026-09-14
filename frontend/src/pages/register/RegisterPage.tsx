import { Link } from 'react-router-dom';
import { RegisterForm } from '@features/register';

export const RegisterPage = (): JSX.Element => {
  return (
    <section className="auth-split">
      <div className="auth-side">
        <p className="hero-kicker">Join BeingWandrer</p>
        <h2>Create an account and book live fares in minutes.</h2>
        <p>Optional — you can still book as a guest without an account.</p>
      </div>
      <div className="auth-panel">
        <div className="card stack" style={{ width: 'min(28rem, 100%)' }}>
          <h1 className="section-title">Create account</h1>
          <RegisterForm />
          <p className="muted">
            Already flying with us? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
};
