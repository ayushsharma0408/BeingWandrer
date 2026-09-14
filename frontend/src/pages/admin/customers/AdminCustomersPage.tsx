import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { listCustomersApi } from '@entities/admin';
import { formatDateTime } from '@shared/lib/datetime';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminResetFiltersButton } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

export const AdminCustomersPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const page = Number(params.get('page') ?? '1');
  const hasFilters = Boolean(params.get('q'));

  const query = useQuery({
    queryKey: ['admin-customers', page, params.get('q')],
    queryFn: () => listCustomersApi({ page, limit: 20, ...(params.get('q') ? { q: params.get('q') ?? undefined } : {}) }),
  });

  const resetFilters = (): void => {
    setSearch('');
    setParams({});
  };

  return (
    <div className="stack">
      <AdminPageHeader
        title="Customers"
        subtitle="Travellers with consumer accounts."
        actions={
          <>
            <AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />
            <Link to="/admin/customers/new" className="btn btn-primary">
              Add customer
            </Link>
          </>
        }
      />
      <form
        className="admin-search"
        onSubmit={(event) => {
          event.preventDefault();
          const next = new URLSearchParams(params);
          next.set('page', '1');
          if (search) next.set('q', search);
          else next.delete('q');
          setParams(next);
        }}
      >
        <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, mobile" />
        <button type="submit" className="btn btn-outline">
          Search
        </button>
        <AdminResetFiltersButton onReset={resetFilters} disabled={!hasFilters} />
      </form>
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Bookings</th>
              <th>Searches</th>
              <th>Active</th>
              <th>Last login</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>{row.fullName ?? '—'}</td>
                <td>{row.email}</td>
                <td>{row.mobile ?? '—'}</td>
                <td>
                  <Link to={`/admin/bookings?customerId=${row.id}`}>{row.bookingCount}</Link>
                </td>
                <td>
                  <Link to={`/admin/search-records?userId=${row.id}`}>{row.searchCount}</Link>
                </td>
                <td>{row.isActive ? 'Yes' : 'No'}</td>
                <td>{formatDateTime(row.lastLoginAt)}</td>
                <td>
                  <Link to={`/admin/customers/${row.id}`} className="btn btn-ghost">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No customers found." /> : null}
      </div>
      {query.data ? (
        <AdminPager
          page={query.data.page}
          totalPages={query.data.totalPages}
          total={query.data.total}
          onPageChange={(nextPage) => {
            const next = new URLSearchParams(params);
            next.set('page', String(nextPage));
            setParams(next);
          }}
        />
      ) : null}
    </div>
  );
};
