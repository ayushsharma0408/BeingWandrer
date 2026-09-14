import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { createCustomerApi, getCustomerApi, updateCustomerApi } from '@entities/admin';
import { ApiClientError } from '@shared/api';
import { AdminPageHeader } from '@shared/ui/admin';

const schema = z.object({
  fullName: z.string().trim().min(1, 'Name is required'),
  email: z.string().email(),
  mobile: z.string().optional(),
  password: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export const AdminCustomerFormPage = (): JSX.Element => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const existing = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => getCustomerApi(id as string),
    enabled: !isNew,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: existing.data
      ? {
          fullName: existing.data.customer.fullName ?? '',
          email: existing.data.customer.email,
          mobile: existing.data.customer.mobile ?? '',
          password: '',
          isActive: existing.data.customer.isActive,
        }
      : { fullName: '', email: '', mobile: '', password: '', isActive: true },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const body = {
        fullName: values.fullName,
        email: values.email,
        ...(values.mobile ? { mobile: values.mobile } : {}),
        isActive: values.isActive,
        ...(values.password ? { password: values.password } : {}),
      };
      if (isNew) {
        if (!values.password || values.password.length < 8) {
          throw new ApiClientError('Password must be at least 8 characters', 'VALIDATION_ERROR', 422, 'password');
        }
        return createCustomerApi({ ...body, password: values.password });
      }
      return updateCustomerApi(id as string, body);
    },
    onSuccess: () => navigate('/admin/customers'),
  });

  return (
    <div className="stack">
      <AdminPageHeader title={isNew ? 'Add customer' : 'Edit customer'} />
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
        <label className="admin-check">
          <input type="checkbox" {...form.register('isActive')} />
          Active
        </label>
        {save.error instanceof ApiClientError ? <p className="field-error">{save.error.message}</p> : null}
        <div className="admin-page-actions">
          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
          <Link to="/admin/customers" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};
