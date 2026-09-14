export const FaqPage = (): JSX.Element => {
  return (
    <div className="page-shell">
      <div className="wrap card stack">
        <h1 className="section-title">FAQs</h1>
        <div>
          <h3>Do I need an account to book?</h3>
          <p className="muted">No. Guest checkout collects traveller, billing, and card details. Sign in if you want the trip on My trips.</p>
        </div>
        <div>
          <h3>Is the fare ticketed immediately?</h3>
          <p className="muted">The partner search API returns live prices. Bookings are stored as a pending hold until a ticketing API is issued.</p>
        </div>
        <div>
          <h3>Can I add refundable protection?</h3>
          <p className="muted">Yes — step 2 of checkout offers a refundable booking add-on and an all-in-one pack, the same flow as a typical OTA.</p>
        </div>
      </div>
    </div>
  );
};
