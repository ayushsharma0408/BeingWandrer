import { Link } from 'react-router-dom';
import { Button } from '@shared/ui';

interface TicketActionsProps {
  bookingId: string;
  isGuest: boolean;
}

export const TicketActions = ({ bookingId, isGuest }: TicketActionsProps): JSX.Element => {
  return (
    <div className="ticket-actions">
      <Button type="button" variant="outline" onClick={() => window.print()}>
        Print ticket
      </Button>
      <Link to="/">
        <Button type="button" variant="primary">
          Search more flights
        </Button>
      </Link>
      {isGuest ? null : (
        <Link to={`/bookings/${bookingId}`}>
          <Button type="button" variant="ghost">
            View in My trips
          </Button>
        </Link>
      )}
    </div>
  );
};
