import { Button } from '@shared/ui';

interface AlertSubmitButtonProps {
  isSubmitting: boolean;
}

export const AlertSubmitButton = ({ isSubmitting }: AlertSubmitButtonProps): JSX.Element => {
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Saving…' : 'Notify me'}
    </Button>
  );
};
