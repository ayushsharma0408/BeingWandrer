import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { assignInquiryApi, listInquiriesApi } from '@entities/admin';
import { formatDate, formatDateTime } from '@shared/lib/datetime';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminResetFiltersButton } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

export const AdminInquiriesPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const assignment = (params.get('assignment') ?? 'unassigned') as 'assigned' | 'unassigned';
  const hasFilters = params.get('assignment') === 'assigned';
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-inquiries', page, assignment],
    queryFn: () => listInquiriesApi({ page, limit: 20, assignment }),
  });

  const assign = useMutation({
    mutationFn: assignInquiryApi,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['admin-inquiries'] });
    },
  });

  return (
    <div className="stack">
      <AdminPageHeader
        title="Offer inquiries"
        subtitle="Leads submitted from offer pages."
        actions={<AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />}
      />
      <div className="admin-toolbar">
        <div className="admin-tabs">
          {([
            ['unassigned', 'Unassigned'],
            ['assigned', 'Assigned'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={assignment === value ? 'admin-tab is-active' : 'admin-tab'}
              onClick={() => setParams({ assignment: value, page: '1' })}
            >
              {label}
            </button>
          ))}
        </div>
        <AdminResetFiltersButton onReset={() => setParams({})} disabled={!hasFilters} />
      </div>
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      {assign.error instanceof ApiClientError ? <p className="field-error">{assign.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Offer</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Pax</th>
              <th>Travel date</th>
              <th>Assigned to</th>
              <th>Received</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((row) => (
              <tr key={row.id}>
                <td>{row.offerPageName ?? '—'}</td>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                <td>{row.email}</td>
                <td>{row.passengerCount}</td>
                <td>{row.travelDate ? formatDate(row.travelDate) : '—'}</td>
                <td>{row.assignedTo?.fullName ?? row.assignedTo?.email ?? '—'}</td>
                <td>{formatDateTime(row.createdAt)}</td>
                <td>
                  {!row.assignedTo ? (
                    <button type="button" className="btn btn-outline" disabled={assign.isPending} onClick={() => assign.mutate(row.id)}>
                      Assign to me
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No inquiries in this queue." /> : null}
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
