import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { USER_ROLES, type UserRole } from '@best-in-flights-booking/shared-core';
import { listStaffApi } from '@entities/admin';
import { useAppSelector } from '@shared/store';
import { formatDateTime } from '@shared/lib/datetime';
import { AdminEmpty, AdminPageHeader, AdminPager, AdminRefreshButton, AdminResetFiltersButton, AdminStatusBadge } from '@shared/ui/admin';
import { ApiClientError } from '@shared/api';

const ROLES: Array<{ value: '' | UserRole; label: string }> = [
  { value: '', label: 'All staff' },
  { value: USER_ROLES.ADMIN, label: 'Admins' },
  { value: USER_ROLES.MANAGER, label: 'Managers' },
  { value: USER_ROLES.EMPLOYEE, label: 'Employees' },
];

export const AdminStaffPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const page = Number(params.get('page') ?? '1');
  const role = (params.get('role') ?? '') as UserRole | '';
  const current = useAppSelector((state) => state.user.current);
  const canWrite = current?.role === USER_ROLES.ADMIN || current?.role === USER_ROLES.MANAGER;
  const hasFilters = Boolean(role || params.get('q'));

  const query = useQuery({
    queryKey: ['admin-staff', page, role, params.get('q')],
    queryFn: () =>
      listStaffApi({
        page,
        limit: 20,
        ...(params.get('q') ? { q: params.get('q') ?? undefined } : {}),
        ...(role ? { role } : {}),
      }),
  });

  const applySearch = (): void => {
    const next = new URLSearchParams(params);
    next.set('page', '1');
    if (search) next.set('q', search);
    else next.delete('q');
    setParams(next);
  };

  const resetFilters = (): void => {
    setSearch('');
    setParams({});
  };

  return (
    <div className="stack">
      <AdminPageHeader
        title="Staff"
        subtitle="Admins, managers, and employees who operate the portal."
        actions={
          <>
            <AdminRefreshButton onRefresh={() => void query.refetch()} isRefreshing={query.isRefetching} />
            {canWrite ? (
              <Link to="/admin/staff/new" className="btn btn-primary">
                Add staff
              </Link>
            ) : null}
          </>
        }
      />
      <div className="admin-toolbar">
        <div className="admin-tabs">
          {ROLES.map((item) => (
            <button
              key={item.label}
              type="button"
              className={role === item.value ? 'admin-tab is-active' : 'admin-tab'}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set('page', '1');
                if (item.value) next.set('role', item.value);
                else next.delete('role');
                setParams(next);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <form
          className="admin-search"
          onSubmit={(event) => {
            event.preventDefault();
            applySearch();
          }}
        >
          <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, mobile" />
          <button type="submit" className="btn btn-outline">
            Search
          </button>
          <AdminResetFiltersButton onReset={resetFilters} disabled={!hasFilters} />
        </form>
      </div>
      {query.error instanceof ApiClientError ? <p className="field-error">{query.error.message}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Active</th>
              <th>Last login</th>
              <th>Last logout</th>
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
                  <AdminStatusBadge value={row.role} />
                </td>
                <td>{row.isActive ? 'Yes' : 'No'}</td>
                <td>{formatDateTime(row.lastLoginAt)}</td>
                <td>{formatDateTime(row.lastLogoutAt)}</td>
                <td>
                  {canWrite ? (
                    <Link to={`/admin/staff/${row.id}`} className="btn btn-ghost">
                      Edit
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.data?.items.length === 0 ? <AdminEmpty message="No staff match these filters." /> : null}
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
