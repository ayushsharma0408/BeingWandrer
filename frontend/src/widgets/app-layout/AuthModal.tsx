import { useState } from 'react';
import { LoginForm } from '@features/login';
import { RegisterForm } from '@features/register';
import { useSitePrefs } from '@shared/i18n';
import { Button } from '@shared/ui';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal = ({ onClose }: AuthModalProps): JSX.Element => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { t } = useSitePrefs();

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2 id="auth-modal-title">{mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label={t('auth.close')}>
            ×
          </button>
        </div>
        <p className="muted">{t('auth.guestNote')}</p>
        <div className="trip-pills">
          <Button type="button" variant={mode === 'login' ? 'primary' : 'outline'} onClick={() => setMode('login')}>
            {t('auth.signIn')}
          </Button>
          <Button type="button" variant={mode === 'register' ? 'primary' : 'outline'} onClick={() => setMode('register')}>
            {t('auth.register')}
          </Button>
        </div>
        {mode === 'login' ? <LoginForm onAuthenticated={onClose} /> : <RegisterForm onAuthenticated={onClose} />}
      </div>
    </div>
  );
};
