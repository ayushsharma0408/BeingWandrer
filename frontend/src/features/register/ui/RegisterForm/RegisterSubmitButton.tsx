import { Button } from '@shared/ui';

interface RegisterSubmitButtonProps {
  isSubmitting: boolean;
}

export const RegisterSubmitButton = ({ isSubmitting }: RegisterSubmitButtonProps): JSX.Element => {
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Creating account…' : 'Create account'}
    </Button>
  );
};
