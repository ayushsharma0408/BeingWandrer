import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@features/auth';
import { BookPage } from '@pages/book';
import { BookingSuccessPage } from '@pages/book';
import { BookingDetailPage, BookingsPage } from '@pages/bookings';
import { AboutPage } from '@pages/about';
import { DealsPage } from '@pages/deals';
import { FaqPage } from '@pages/faq';
import { FlightsPage } from '@pages/flights';
import { HomePage } from '@pages/home';
import { LoginPage } from '@pages/login';
import { RegisterPage } from '@pages/register';
import { AppLayout } from '@widgets/app-layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'flights', element: <FlightsPage /> },
      { path: 'deals', element: <DealsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faqs', element: <FaqPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'book/success', element: <BookingSuccessPage /> },
      { path: 'book/:offerId', element: <BookPage /> },
      {
        path: 'bookings',
        element: (
          <RequireAuth>
            <BookingsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'bookings/:id',
        element: (
          <RequireAuth>
            <BookingDetailPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);
