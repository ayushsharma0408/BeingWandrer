import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { listOffersApi } from '@entities/admin';
import { formatDate } from '@shared/lib/datetime';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminStatusBadge } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

export const AdminOffersPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const query = useQuery({
    queryKey: ['admin-offers', page],
    queryFn: () => listOffersApi({ page, limit: 20 }),
  });

  return (
    <div className="stack">
      <AdminPageHeader
        title="Offer pages"
        subtitle="Campaign pages shown on the consumer deals experience."
        actions={
          <>
            <AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />
            <Link to="/admin/offers/new" className="btn btn-primary">
              Add offer
            </Link>
          </>
        }
      />
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Popup</th>
              <th>Publish date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.slug}</td>
                <td>
                  <AdminStatusBadge value={row.status} />
                </td>
                <td>{row.isShowPopup ? 'On' : 'Off'}</td>
                <td>{formatDate(row.publishDate)}</td>
                <td>
                  <div className="admin-page-actions">
                    {row.status === 'PUBLISH' ? (
                      <Link to={`/deals/${row.slug}`} className="btn btn-ghost" target="_blank" rel="noreferrer">
                        View
                      </Link>
                    ) : null}
                    <Link to={`/admin/offers/${row.id}`} className="btn btn-ghost">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No offer pages yet." /> : null}
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
