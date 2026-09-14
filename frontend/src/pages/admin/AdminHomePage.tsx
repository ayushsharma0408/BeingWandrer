import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminDashboardApi } from '@entities/admin';
import { AdminPageHeader } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

const CARDS = [
  { key: 'all', label: 'All bookings', to: '/admin/bookings' },
  { key: 'unassigned', label: 'Unassigned', to: '/admin/bookings?status=UNASSIGNED' },
  { key: 'assigned', label: 'Assigned', to: '/admin/bookings?status=ASSIGNED' },
  { key: 'processing', label: 'Processing', to: '/admin/bookings?status=PROCESSING' },
  { key: 'followUp', label: 'Follow up', to: '/admin/bookings?status=FOLLOW_UP' },
  { key: 'confirmed', label: 'Confirmed', to: '/admin/bookings?status=CONFIRMED' },
  { key: 'cancelled', label: 'Cancelled', to: '/admin/bookings?status=CANCELLED' },
  { key: 'failed', label: 'Failed', to: '/admin/bookings?status=FAILED' },
  { key: 'chargeback', label: 'Chargeback', to: '/admin/bookings?status=CHARGEBACK' },
  { key: 'staff', label: 'Staff', to: '/admin/staff' },
  { key: 'customers', label: 'Customers', to: '/admin/customers' },
  { key: 'searches', label: 'Search records', to: '/admin/search-records' },
  { key: 'inquiries', label: 'Offer inquiries', to: '/admin/inquiries' },
] as const;

export const AdminHomePage = (): JSX.Element => {
  const query = useQuery({ queryKey: ['admin-dashboard'], queryFn: getAdminDashboardApi });
  const counts = query.data?.counts;

  return (
    <div className="stack">
      <AdminPageHeader title="Home" subtitle="Live snapshot of bookings, staff, and demand." />
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-stat-grid">
        {CARDS.map((card) => (
          <Link key={card.key} to={card.to} className="admin-stat-card">
            <span>{card.label}</span>
            <strong>{query.isLoading ? '…' : counts?.[card.key] ?? 0}</strong>
          </Link>
        ))}
      </div>
    </div>
  );
};
