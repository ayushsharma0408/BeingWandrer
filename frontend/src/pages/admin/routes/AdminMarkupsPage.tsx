import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { deleteMarkupApi, getRouteApi, listMarkupsApi, updateMarkupApi } from '@entities/admin';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminStatusBadge } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

export const AdminMarkupsPage = (): JSX.Element => {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const client = useQueryClient();
  const routeQuery = useQuery({ queryKey: ['admin-route', id], queryFn: () => getRouteApi(id), enabled: Boolean(id) });
  const query = useQuery({
    queryKey: ['admin-markups', id, page],
    queryFn: () => listMarkupsApi(id, { page, limit: 20 }),
    enabled: Boolean(id),
  });

  const toggle = useMutation({
    mutationFn: (input: { markupId: string; status: 'ENABLE' | 'DISABLE' }) => updateMarkupApi(input.markupId, { status: input.status }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['admin-markups', id] });
      void client.invalidateQueries({ queryKey: ['flights'] });
    },
  });
  const remove = useMutation({
    mutationFn: deleteMarkupApi,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['admin-markups', id] });
      void client.invalidateQueries({ queryKey: ['flights'] });
    },
  });

  return (
    <div className="stack">
      <AdminPageHeader
        title={`Markup · ${routeQuery.data?.route.referenceName ?? 'Route'}`}
        subtitle={
          routeQuery.data
            ? `${routeQuery.data.route.origin} → ${routeQuery.data.route.destination} · ${routeQuery.data.route.airlines}`
            : 'Per-passenger pricing rules for this route.'
        }
        actions={
          <>
            <AdminRefreshButton
              onRefresh={() => {
                void query.refetch();
                void routeQuery.refetch();
              }}
              isRefreshing={query.isRefetching || routeQuery.isRefetching}
            />
            <Link to={`/admin/routes/${id}/markups/new`} className="btn btn-primary">
              Add markup
            </Link>
          </>
        }
      />
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Classes</th>
              <th>Type</th>
              <th>Amount</th>
              <th>1–9 pax</th>
              <th>Active dates</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>
                  In {row.inboundClasses || '—'}
                  <br />
                  Out {row.outboundClasses || '—'}
                </td>
                <td>{row.markupType}</td>
                <td>{row.markupAmount}</td>
                <td>
                  {[row.onePx, row.twoPx, row.threePx, row.fourPx, row.fivePx, row.sixPx, row.sevenPx, row.eightPx, row.ninePx]
                    .filter(Boolean)
                    .join(' / ') || '—'}
                </td>
                <td>
                  {row.startActiveDate ?? '—'} → {row.endActiveDate ?? '—'}
                </td>
                <td>
                  <AdminStatusBadge value={row.status} />
                </td>
                <td className="admin-row-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() =>
                      toggle.mutate({ markupId: row.id, status: row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE' })
                    }
                  >
                    {row.status === 'ENABLE' ? 'Disable' : 'Enable'}
                  </button>
                  <Link to={`/admin/routes/${id}/markups/${row.id}`} className="btn btn-ghost">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      if (window.confirm('Delete this markup?')) {
                        remove.mutate(row.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No markup rules on this route." /> : null}
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
