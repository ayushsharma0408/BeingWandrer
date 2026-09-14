import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getFlightOfferApi } from '@entities/flight-offer';
import { CheckoutWizard } from '@features/book-flight';
import { ApiClientError } from '@shared/api';
import { AuthModal } from '@widgets/app-layout';

export const BookPage = (): JSX.Element => {
  const { offerId } = useParams<{ offerId: string }>();
  const [authOpen, setAuthOpen] = useState(false);
  const query = useQuery({
    queryKey: ['flight-offer', offerId],
    queryFn: () => getFlightOfferApi(offerId ?? ''),
    enabled: Boolean(offerId),
  });

  if (query.isLoading) {
    return (
      <div className="page-shell">
        <div className="wrap">
          <div className="skeleton" />
        </div>
      </div>
    );
  }

  if (query.error instanceof ApiClientError || !query.data) {
    return (
      <div className="page-shell">
        <div className="wrap">
          <p className="field-error">
            {query.error instanceof ApiClientError ? query.error.message : 'Offer expired. Search again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell checkout-page">
      <div className="wrap">
        <CheckoutWizard offer={query.data.offer} onOpenAuth={() => setAuthOpen(true)} />
      </div>
      {authOpen ? <AuthModal onClose={() => setAuthOpen(false)} /> : null}
    </div>
  );
};
