import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteRouteApi, listRoutesApi } from '@entities/admin';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminResetFiltersButton, AdminStatusBadge } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

export const AdminRoutesPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const q = params.get('q') ?? '';
  const [search, setSearch] = useState(q);
  const hasFilters = Boolean(q);
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-routes', page, q],
    queryFn: () =>
      listRoutesApi({
        page,
        limit: 20,
        ...(q ? { q } : {}),
      }),
  });

  const remove = useMutation({
    mutationFn: deleteRouteApi,
    onSuccess: () => void client.invalidateQueries({ queryKey: ['admin-routes'] }),
  });

  const resetFilters = (): void => {
    setSearch('');
    setParams({});
  };

  return (
    <div className="stack">
      <AdminPageHeader
        title="Routes"
        subtitle="Origin/destination rules and airline markup containers."
        actions={
          <>
            <AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />
            <Link to="/admin/routes/new" className="btn btn-primary">
              Add route
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
          if (search.trim()) next.set('q', search.trim());
          else next.delete('q');
          setParams(next);
        }}
      >
        <input
          className="input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reference, origin, destination"
        />
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
              <th>Reference</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Airlines</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>{row.referenceName}</td>
                <td>{row.origin}</td>
                <td>{row.destination}</td>
                <td>{row.airlines}</td>
                <td>
                  <AdminStatusBadge value={row.status} />
                </td>
                <td className="admin-row-actions">
                  <Link to={`/admin/routes/${row.id}/markups`} className="btn btn-ghost">
                    Markup
                  </Link>
                  <Link to={`/admin/routes/${row.id}`} className="btn btn-ghost">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      if (window.confirm('Delete this route and its markups?')) {
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
        {query.data?.items.length === 0 ? <AdminEmpty message="No routes yet." /> : null}
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
