import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { MdFlightLand, MdFlightTakeoff, MdSwapHoriz } from 'react-icons/md';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ROUTE_STATUSES } from '@best-in-flights-booking/shared-core';
import { createRouteApi, getRouteApi, updateRouteApi } from '@entities/admin';
import { ApiClientError } from '@shared/api';
import { AirportPicker } from '@shared/ui';
import { AdminPageHeader } from '@shared/ui/admin';

const schema = z
  .object({
    referenceName: z.string().trim().min(1),
    origin: z.string().trim().toUpperCase().length(3, 'Select an origin airport'),
    destination: z.string().trim().toUpperCase().length(3, 'Select a destination airport'),
    airlines: z.string().trim().min(1),
    status: z.enum([ROUTE_STATUSES.ACTIVE, ROUTE_STATUSES.INACTIVE]),
  })
  .refine((value) => value.origin !== value.destination, {
    message: 'Origin and destination must differ',
    path: ['destination'],
  });

type FormValues = z.infer<typeof schema>;
type AirportPanel = 'origin' | 'destination' | null;

export const AdminRouteFormPage = (): JSX.Element => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [openPanel, setOpenPanel] = useState<AirportPanel>(null);
  const existing = useQuery({
    queryKey: ['admin-route', id],
    queryFn: () => getRouteApi(id as string),
    enabled: !isNew,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: existing.data
      ? {
          referenceName: existing.data.route.referenceName,
          origin: existing.data.route.origin,
          destination: existing.data.route.destination,
          airlines: existing.data.route.airlines,
          status: existing.data.route.status,
        }
      : {
          referenceName: '',
          origin: '',
          destination: '',
          airlines: 'ALL',
          status: ROUTE_STATUSES.ACTIVE,
        },
  });

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        ...values,
        origin: values.origin.toUpperCase(),
        destination: values.destination.toUpperCase(),
      };
      return isNew ? createRouteApi(body) : updateRouteApi(id as string, body);
    },
    onSuccess: () => navigate('/admin/routes'),
  });

  return (
    <div className="stack">
      <AdminPageHeader title={isNew ? 'Add route' : 'Edit route'} />
      <form className="card stack admin-form" onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate>
        <label className="field">
          <span className="field-label">Reference name</span>
          <input className="input" {...form.register('referenceName')} />
          {form.formState.errors.referenceName ? (
            <p className="field-error">{form.formState.errors.referenceName.message}</p>
          ) : null}
        </label>
        <div className="admin-airport-row">
          <AirportPicker
            label="Origin"
            icon={<MdFlightTakeoff className="tv-icon" aria-hidden />}
            value={form.watch('origin')}
            onChange={(code) => {
              form.setValue('origin', code, { shouldValidate: true });
              setOpenPanel('destination');
            }}
            hiddenInputProps={form.register('origin')}
            error={form.formState.errors.origin?.message}
            isOpen={openPanel === 'origin'}
            onOpenChange={(open) => setOpenPanel(open ? 'origin' : null)}
          />
          <button
            type="button"
            className="tv-swap"
            aria-label="Swap origin and destination"
            onClick={() => {
              const origin = form.getValues('origin');
              const destination = form.getValues('destination');
              form.setValue('origin', destination, { shouldValidate: true });
              form.setValue('destination', origin, { shouldValidate: true });
            }}
          >
            <MdSwapHoriz className="tv-icon" aria-hidden />
          </button>
          <AirportPicker
            label="Destination"
            icon={<MdFlightLand className="tv-icon" aria-hidden />}
            value={form.watch('destination')}
            onChange={(code) => {
              form.setValue('destination', code, { shouldValidate: true });
              setOpenPanel(null);
            }}
            hiddenInputProps={form.register('destination')}
            error={form.formState.errors.destination?.message}
            isOpen={openPanel === 'destination'}
            onOpenChange={(open) => setOpenPanel(open ? 'destination' : null)}
          />
        </div>
        <label className="field">
          <span className="field-label">Airlines</span>
          <input className="input" {...form.register('airlines')} placeholder="ALL or AI,UK" />
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select className="input" {...form.register('status')}>
            <option value={ROUTE_STATUSES.ACTIVE}>Active</option>
            <option value={ROUTE_STATUSES.INACTIVE}>Inactive</option>
          </select>
        </label>
        {save.error instanceof ApiClientError ? <p className="field-error">{save.error.message}</p> : null}
        <div className="admin-page-actions">
          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
          <Link to="/admin/routes" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};
