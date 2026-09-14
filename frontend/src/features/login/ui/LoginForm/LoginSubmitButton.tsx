import { Button } from '@shared/ui';

interface LoginSubmitButtonProps {
  isSubmitting: boolean;
}

export const LoginSubmitButton = ({ isSubmitting }: LoginSubmitButtonProps): JSX.Element => {
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Signing in…' : 'Sign in'}
    </Button>
  );
};
