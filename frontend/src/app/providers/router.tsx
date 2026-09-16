import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@features/auth';
import { RequireStaff } from '@features/admin-auth';
import { BookPage } from '@pages/book';
import { BookingSuccessPage } from '@pages/book';
import { BookingDetailPage, BookingsPage } from '@pages/bookings';
import { AboutPage } from '@pages/about';
import { DealsPage } from '@pages/deals';
import { FaqPage } from '@pages/faq';
import { FlightsPage } from '@pages/flights';
import { HomePage } from '@pages/home';
import { LoginPage } from '@pages/login';
import { AdminLoginPage } from '@pages/admin-login';
import {
  AdminActivityPage,
  AdminBookingDetailPage,
  AdminBookingsPage,
  AdminCustomerFormPage,
  AdminCustomersPage,
  AdminHomePage,
  AdminInquiriesPage,
  AdminMarkupFormPage,
  AdminMarkupsPage,
  AdminOfferFormPage,
  AdminOffersPage,
  AdminRouteFormPage,
  AdminRoutesPage,
  AdminSearchRecordsPage,
  AdminSessionsPage,
  AdminStaffFormPage,
  AdminStaffPage,
} from '@pages/admin';
import { RegisterPage } from '@pages/register';
import { AppLayout } from '@widgets/app-layout';
import { AdminLayout } from '@widgets/admin-layout';

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
      { path: 'login/admin', element: <AdminLoginPage /> },
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
  {
    path: '/admin',
    element: (
      <RequireStaff>
        <AdminLayout />
      </RequireStaff>
    ),
    children: [
      { index: true, element: <AdminHomePage /> },
      { path: 'staff', element: <AdminStaffPage /> },
      { path: 'staff/new', element: <AdminStaffFormPage /> },
      { path: 'staff/:id', element: <AdminStaffFormPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'customers/new', element: <AdminCustomerFormPage /> },
      { path: 'customers/:id', element: <AdminCustomerFormPage /> },
      { path: 'sessions', element: <AdminSessionsPage /> },
      { path: 'activity', element: <AdminActivityPage /> },
      { path: 'offers', element: <AdminOffersPage /> },
      { path: 'offers/new', element: <AdminOfferFormPage /> },
      { path: 'offers/:id', element: <AdminOfferFormPage /> },
      { path: 'search-records', element: <AdminSearchRecordsPage /> },
      { path: 'inquiries', element: <AdminInquiriesPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
      { path: 'bookings/:id', element: <AdminBookingDetailPage /> },
      { path: 'routes', element: <AdminRoutesPage /> },
      { path: 'routes/new', element: <AdminRouteFormPage /> },
      { path: 'routes/:id', element: <AdminRouteFormPage /> },
      { path: 'routes/:id/markups', element: <AdminMarkupsPage /> },
      { path: 'routes/:id/markups/new', element: <AdminMarkupFormPage /> },
      { path: 'routes/:id/markups/:markupId', element: <AdminMarkupFormPage /> },
    ],
  },
]);
