import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { listActivityApi } from '@entities/admin';
import { formatDateTime } from '@shared/lib/datetime';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminStatusBadge } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

export const AdminActivityPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const query = useQuery({
    queryKey: ['admin-activity', page],
    queryFn: () => listActivityApi({ page, limit: 50 }),
  });

  return (
    <div className="stack">
      <AdminPageHeader
        title="Activity logs"
        subtitle="Audit trail of staff actions across the portal."
        actions={<AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />}
      />
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>By</th>
              <th>Type</th>
              <th>Module</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTime(row.createdAt)}</td>
                <td>{row.action}</td>
                <td>{row.actionBy?.fullName ?? row.actionBy?.email ?? '—'}</td>
                <td>
                  <AdminStatusBadge value={row.actionType} />
                </td>
                <td>{row.module}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No activity yet." /> : null}
      </div>
      {query.data ? (
        <AdminPager
          page={query.data.page}
          totalPages={query.data.totalPages}
          total={query.data.total}
          onPageChange={(nextPage) => setParams({ page: String(nextPage) })}
        />
      ) : null}
    </div>
  );
};
