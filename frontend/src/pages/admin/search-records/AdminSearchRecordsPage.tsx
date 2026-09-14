import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { listSearchRecordsApi } from '@entities/admin';
import { formatDateTime } from '@shared/lib/datetime';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminResetFiltersButton } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

const today = (): string => new Date().toISOString().slice(0, 10);

export const AdminSearchRecordsPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const from = params.get('from') ?? today();
  const to = params.get('to') ?? today();
  const userId = params.get('userId') ?? '';
  const hasFilters = Boolean(params.get('from') || params.get('to') || userId);

  const query = useQuery({
    queryKey: ['admin-search-records', page, from, to, userId],
    queryFn: () =>
      listSearchRecordsApi({
        page,
        limit: 50,
        from,
        to,
        ...(userId ? { userId } : {}),
      }),
  });

  const setFilter = (key: string, value: string): void => {
    const next = new URLSearchParams(params);
    next.set('page', '1');
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const resetFilters = (): void => {
    setParams({});
  };

  return (
    <div className="stack">
      <AdminPageHeader
        title="Search records"
        subtitle="D2C flight searches from the consumer site."
        actions={<AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />}
      />
      <div className="admin-search">
        <input className="input" type="date" value={from} onChange={(event) => setFilter('from', event.target.value)} />
        <input className="input" type="date" value={to} onChange={(event) => setFilter('to', event.target.value)} />
        <AdminResetFiltersButton onReset={resetFilters} disabled={!hasFilters} />
      </div>
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>IP</th>
              <th>Trip</th>
              <th>Route</th>
              <th>Dates</th>
              <th>Class</th>
              <th>Pax</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTime(row.createdAt)}</td>
                <td>{row.ipAddress}</td>
                <td>{row.flightMode}</td>
                <td>
                  {row.origin} → {row.destination}
                </td>
                <td>
                  {row.departureDate}
                  {row.returnDate ? ` / ${row.returnDate}` : ''}
                </td>
                <td>{row.travelClass}</td>
                <td>
                  {row.adults}/{row.children}/{row.infants}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No searches in this range." /> : null}
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
