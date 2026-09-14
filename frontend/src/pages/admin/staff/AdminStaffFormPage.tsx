import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { USER_ROLES } from '@best-in-flights-booking/shared-core';
import { createStaffApi, deleteStaffApi, getStaffApi, updateStaffApi } from '@entities/admin';
import { ApiClientError } from '@shared/api';
import { useAppSelector } from '@shared/store';
import { AdminPageHeader } from '@shared/ui/admin';

const schema = z.object({
  fullName: z.string().trim().min(1, 'Name is required'),
  email: z.string().email(),
  mobile: z.string().optional(),
  password: z.string().optional(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE]),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export const AdminStaffFormPage = (): JSX.Element => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const current = useAppSelector((state) => state.user.current);
  const canDelete = current?.role === USER_ROLES.ADMIN && !isNew;

  const existing = useQuery({
    queryKey: ['admin-staff', id],
    queryFn: () => getStaffApi(id as string),
    enabled: !isNew,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: existing.data
      ? {
          fullName: existing.data.staff.fullName ?? '',
          email: existing.data.staff.email,
          mobile: existing.data.staff.mobile ?? '',
          password: '',
          role: existing.data.staff.role as FormValues['role'],
          isActive: existing.data.staff.isActive,
        }
      : {
          fullName: '',
          email: '',
          mobile: '',
          password: '',
          role: USER_ROLES.EMPLOYEE,
          isActive: true,
        },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const body = {
        fullName: values.fullName,
        email: values.email,
        ...(values.mobile ? { mobile: values.mobile } : {}),
        role: values.role,
        isActive: values.isActive,
        ...(values.password ? { password: values.password } : {}),
      };
      if (isNew) {
        if (!values.password || values.password.length < 8) {
          throw new ApiClientError('Password must be at least 8 characters', 'VALIDATION_ERROR', 422, 'password');
        }
        return createStaffApi({ ...body, password: values.password });
      }
      return updateStaffApi(id as string, body);
    },
    onSuccess: () => navigate('/admin/staff'),
  });

  const remove = useMutation({
    mutationFn: () => deleteStaffApi(id as string),
    onSuccess: () => navigate('/admin/staff'),
  });

  const error =
    save.error instanceof ApiClientError
      ? save.error.message
      : remove.error instanceof ApiClientError
        ? remove.error.message
        : null;

  return (
    <div className="stack">
      <AdminPageHeader title={isNew ? 'Add staff' : 'Edit staff'} />
      <form className="card stack admin-form" onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate>
        <label className="field">
          <span className="field-label">Full name</span>
          <input className="input" {...form.register('fullName')} />
          {form.formState.errors.fullName ? <p className="field-error">{form.formState.errors.fullName.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input className="input" type="email" {...form.register('email')} />
          {form.formState.errors.email ? <p className="field-error">{form.formState.errors.email.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">Mobile</span>
          <input className="input" {...form.register('mobile')} />
        </label>
        <label className="field">
          <span className="field-label">{isNew ? 'Password' : 'New password (optional)'}</span>
          <input className="input" type="password" {...form.register('password')} />
        </label>
        <label className="field">
          <span className="field-label">Role</span>
          <select className="input" {...form.register('role')} disabled={!isNew && existing.data?.staff.role === USER_ROLES.ADMIN && current?.role !== USER_ROLES.ADMIN}>
            <option value={USER_ROLES.ADMIN}>Admin</option>
            <option value={USER_ROLES.MANAGER}>Manager</option>
            <option value={USER_ROLES.EMPLOYEE}>Employee</option>
          </select>
        </label>
        <label className="admin-check">
          <input type="checkbox" {...form.register('isActive')} />
          Active
        </label>
        {error ? <p className="field-error">{error}</p> : null}
        <div className="admin-page-actions">
          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
          <Link to="/admin/staff" className="btn btn-ghost">
            Cancel
          </Link>
          {canDelete ? (
            <button
              type="button"
              className="btn btn-outline"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm('Delete this staff member?')) {
                  remove.mutate();
                }
              }}
            >
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
};
