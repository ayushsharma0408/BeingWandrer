import type { BookingPassenger } from '@best-in-flights-booking/shared-core';
import { passengerTypeLabel } from './ticket-copy';

interface TicketPassengersProps {
  passengers: BookingPassenger[];
  ticketStatus: string;
}

export const TicketPassengers = ({ passengers, ticketStatus }: TicketPassengersProps): JSX.Element => {
  return (
    <section className="eticket-section">
      <h2>Passengers</h2>
      <table className="eticket-table">
        <thead>
          <tr>
            <th>Traveller</th>
            <th>Type</th>
            <th>Ticket</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((passenger, index) => (
            <tr key={passenger.id}>
              <td>
                <strong>
                  {index + 1}. {passenger.fullName}
                </strong>
              </td>
              <td>{passengerTypeLabel(passenger.passengerType)}</td>
              <td>{ticketStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
