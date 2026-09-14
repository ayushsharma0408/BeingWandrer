import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { MARKUP_STATUSES, MARKUP_TYPES } from '@best-in-flights-booking/shared-core';
import { createMarkupApi, getMarkupApi, updateMarkupApi } from '@entities/admin';
import { ApiClientError } from '@shared/api';
import { AdminPageHeader } from '@shared/ui/admin';

const ALL_CLASSES = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z';
const PAX_FIELDS = ['onePx', 'twoPx', 'threePx', 'fourPx', 'fivePx', 'sixPx', 'sevenPx', 'eightPx', 'ninePx'] as const;

const optionalText = z.string().trim().optional().or(z.literal(''));

const schema = z
  .object({
    inboundClasses: z.string().trim().min(1, 'Inbound classes are required'),
    outboundClasses: z.string().trim().min(1, 'Outbound classes are required'),
    onePx: optionalText,
    twoPx: optionalText,
    threePx: optionalText,
    fourPx: optionalText,
    fivePx: optionalText,
    sixPx: optionalText,
    sevenPx: optionalText,
    eightPx: optionalText,
    ninePx: optionalText,
    markupAmount: z.coerce
      .number({ invalid_type_error: 'Enter a markup amount' })
      .finite({ message: 'Enter a markup amount' })
      .gt(0, 'Markup amount must be greater than 0'),
    markupType: z.enum([MARKUP_TYPES.FIXED, MARKUP_TYPES.PERCENTAGE, MARKUP_TYPES.DISCOUNT]),
    startActiveDate: z.string().trim().min(1, 'Start date is required'),
    endActiveDate: z.string().trim().min(1, 'End date is required'),
    dta: optionalText,
    blackoutDates: optionalText,
    status: z.enum([MARKUP_STATUSES.ENABLE, MARKUP_STATUSES.DISABLE]),
  })
  .refine((values) => values.endActiveDate >= values.startActiveDate, {
    message: 'End date must be on or after start date',
    path: ['endActiveDate'],
  });

type FormValues = z.infer<typeof schema>;

const emptyValues = (): FormValues => ({
  inboundClasses: ALL_CLASSES,
  outboundClasses: ALL_CLASSES,
  onePx: '',
  twoPx: '',
  threePx: '',
  fourPx: '',
  fivePx: '',
  sixPx: '',
  sevenPx: '',
  eightPx: '',
  ninePx: '',
  markupAmount: Number.NaN,
  markupType: MARKUP_TYPES.FIXED,
  startActiveDate: '',
  endActiveDate: '',
  dta: '',
  blackoutDates: '',
  status: MARKUP_STATUSES.ENABLE,
});

const blankToUndefined = (value?: string): string | undefined => {
  const trimmed = value?.trim() ?? '';
  return trimmed || undefined;
};

export const AdminMarkupFormPage = (): JSX.Element => {
  const { id = '', markupId } = useParams();
  const isNew = !markupId || markupId === 'new';
  const navigate = useNavigate();
  const client = useQueryClient();
  const existing = useQuery({
    queryKey: ['admin-markup', markupId],
    queryFn: () => getMarkupApi(markupId as string),
    enabled: !isNew,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
    values: existing.data
      ? {
          inboundClasses: existing.data.markup.inboundClasses || ALL_CLASSES,
          outboundClasses: existing.data.markup.outboundClasses || ALL_CLASSES,
          onePx: existing.data.markup.onePx ?? '',
          twoPx: existing.data.markup.twoPx ?? '',
          threePx: existing.data.markup.threePx ?? '',
          fourPx: existing.data.markup.fourPx ?? '',
          fivePx: existing.data.markup.fivePx ?? '',
          sixPx: existing.data.markup.sixPx ?? '',
          sevenPx: existing.data.markup.sevenPx ?? '',
          eightPx: existing.data.markup.eightPx ?? '',
          ninePx: existing.data.markup.ninePx ?? '',
          markupAmount: existing.data.markup.markupAmount,
          markupType: existing.data.markup.markupType,
          startActiveDate: existing.data.markup.startActiveDate ?? '',
          endActiveDate: existing.data.markup.endActiveDate ?? '',
          dta: existing.data.markup.dta ?? '',
          blackoutDates: existing.data.markup.blackoutDates.join(', '),
          status: existing.data.markup.status,
        }
      : undefined,
  });

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        inboundClasses: values.inboundClasses.trim(),
        outboundClasses: values.outboundClasses.trim(),
        onePx: blankToUndefined(values.onePx),
        twoPx: blankToUndefined(values.twoPx),
        threePx: blankToUndefined(values.threePx),
        fourPx: blankToUndefined(values.fourPx),
        fivePx: blankToUndefined(values.fivePx),
        sixPx: blankToUndefined(values.sixPx),
        sevenPx: blankToUndefined(values.sevenPx),
        eightPx: blankToUndefined(values.eightPx),
        ninePx: blankToUndefined(values.ninePx),
        markupAmount: values.markupAmount,
        markupType: values.markupType,
        startActiveDate: values.startActiveDate,
        endActiveDate: values.endActiveDate,
        dta: blankToUndefined(values.dta),
        blackoutDates: values.blackoutDates
          ? values.blackoutDates.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        status: values.status,
      };
      return isNew ? createMarkupApi(id, body) : updateMarkupApi(markupId as string, body);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['flights'] });
      void client.invalidateQueries({ queryKey: ['admin-markups', id] });
      navigate(`/admin/routes/${id}/markups`);
    },
  });

  const errors = form.formState.errors;

  return (
    <div className="stack">
      <AdminPageHeader title={isNew ? 'Add markup' : 'Edit markup'} />
      <form className="card stack admin-form" onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate>
        <label className="field">
          <span className="field-label">Inbound classes</span>
          <input className="input" {...form.register('inboundClasses')} placeholder={ALL_CLASSES} />
          {errors.inboundClasses ? <p className="field-error">{errors.inboundClasses.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">Outbound classes</span>
          <input className="input" {...form.register('outboundClasses')} placeholder={ALL_CLASSES} />
          {errors.outboundClasses ? <p className="field-error">{errors.outboundClasses.message}</p> : null}
        </label>
        <div className="admin-pax-grid">
          {PAX_FIELDS.map((field, index) => (
            <label key={field} className="field">
              <span className="field-label">{index + 1} pax</span>
              <input className="input" type="number" step="0.01" {...form.register(field)} />
            </label>
          ))}
        </div>
        <p className="field-hint">Leave blank to use markup amount for every party size. Enter 1 to include that party size, or another number to override the amount.</p>
        <label className="field">
          <span className="field-label">Markup amount</span>
          <input className="input" type="number" step="0.01" {...form.register('markupAmount')} />
          {errors.markupAmount ? <p className="field-error">{errors.markupAmount.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">Markup type</span>
          <select className="input" {...form.register('markupType')}>
            <option value={MARKUP_TYPES.FIXED}>Fixed (per passenger)</option>
            <option value={MARKUP_TYPES.PERCENTAGE}>Percentage of fare</option>
            <option value={MARKUP_TYPES.DISCOUNT}>Discount (per passenger)</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">Start date</span>
          <input className="input" type="date" {...form.register('startActiveDate')} />
          {errors.startActiveDate ? <p className="field-error">{errors.startActiveDate.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">End date</span>
          <input className="input" type="date" {...form.register('endActiveDate')} />
          {errors.endActiveDate ? <p className="field-error">{errors.endActiveDate.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">Days to advance (DTA)</span>
          <input className="input" {...form.register('dta')} placeholder="7 or 0-30" />
        </label>
        <label className="field">
          <span className="field-label">Blackout dates</span>
          <input className="input" {...form.register('blackoutDates')} placeholder="YYYY-MM-DD, YYYY-MM-DD" />
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select className="input" {...form.register('status')}>
            <option value={MARKUP_STATUSES.ENABLE}>Enable</option>
            <option value={MARKUP_STATUSES.DISABLE}>Disable</option>
          </select>
        </label>
        {save.error instanceof ApiClientError ? <p className="field-error">{save.error.message}</p> : null}
        <div className="admin-page-actions">
          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
          <Link to={`/admin/routes/${id}/markups`} className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};
