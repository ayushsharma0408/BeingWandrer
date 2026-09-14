import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { listSessionsApi } from '@entities/admin';
import { formatDateTime } from '@shared/lib/datetime';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminResetFiltersButton, AdminStatusBadge } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

export const AdminSessionsPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const audience = (params.get('audience') ?? '') as '' | 'staff' | 'customer';
  const hasFilters = Boolean(audience);

  const query = useQuery({
    queryKey: ['admin-sessions', page, audience],
    queryFn: () => listSessionsApi({ page, limit: 20, ...(audience ? { audience } : {}) }),
  });

  return (
    <div className="stack">
      <AdminPageHeader
        title="Logged in profiles"
        subtitle="Visitor cookie and IP captured when the site opens, plus later logins."
        actions={<AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />}
      />
      <div className="admin-toolbar">
        <div className="admin-tabs">
          {([
            ['', 'All'],
            ['staff', 'Staff'],
            ['customer', 'Customers'],
          ] as const).map(([value, label]) => (
            <button
              key={label}
              type="button"
              className={audience === value ? 'admin-tab is-active' : 'admin-tab'}
              onClick={() => {
                const next = new URLSearchParams();
                next.set('page', '1');
                if (value) next.set('audience', value);
                setParams(next);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <AdminResetFiltersButton onReset={() => setParams({})} disabled={!hasFilters} />
      </div>
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Access time</th>
              <th>Cookie</th>
              <th>IP address</th>
              <th>Access type</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>{row.user?.fullName ?? 'Visitor'}</td>
                <td>{row.user?.email ?? '—'}</td>
                <td>{formatDateTime(row.createdAt)}</td>
                <td className="admin-cookie">{row.visitorId ?? '—'}</td>
                <td>{row.ipAddress}</td>
                <td>
                  <AdminStatusBadge value={row.accessType} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No visits or logins yet." /> : null}
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
