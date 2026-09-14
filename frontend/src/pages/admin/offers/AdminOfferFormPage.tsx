import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { OFFER_PAGE_STATUSES } from '@best-in-flights-booking/shared-core';
import { createOfferApi, getOfferApi, updateOfferApi } from '@entities/admin';
import { ApiClientError } from '@shared/api';
import { AdminPageHeader } from '@shared/ui/admin';

const schema = z.object({
  name: z.string().trim().min(1, 'Offer name is required'),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens'),
  offerLink: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  description: z.string().trim().min(1, 'Add offer details for the website'),
  imageUrl: z.string().trim().url('Enter a valid image URL').optional().or(z.literal('')),
  publishDate: z.string().min(1, 'Publish date is required'),
  status: z.enum([OFFER_PAGE_STATUSES.PUBLISH, OFFER_PAGE_STATUSES.DRAFT]),
  isShowPopup: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export const AdminOfferFormPage = (): JSX.Element => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const existing = useQuery({
    queryKey: ['admin-offer', id],
    queryFn: () => getOfferApi(id as string),
    enabled: !isNew,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: existing.data
      ? {
          name: existing.data.offer.name,
          slug: existing.data.offer.slug,
          offerLink: existing.data.offer.offerLink ?? '',
          description: existing.data.offer.description ?? '',
          imageUrl: existing.data.offer.imageUrl ?? '',
          publishDate: existing.data.offer.publishDate.slice(0, 10),
          status: existing.data.offer.status,
          isShowPopup: existing.data.offer.isShowPopup,
        }
      : {
          name: '',
          slug: '',
          offerLink: '',
          description: '',
          imageUrl: '',
          publishDate: new Date().toISOString().slice(0, 10),
          status: OFFER_PAGE_STATUSES.PUBLISH,
          isShowPopup: false,
        },
  });

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        name: values.name,
        slug: values.slug,
        description: values.description.trim(),
        publishDate: values.publishDate,
        status: values.status,
        isShowPopup: values.isShowPopup,
        ...(values.offerLink ? { offerLink: values.offerLink } : {}),
        ...(values.imageUrl ? { imageUrl: values.imageUrl } : {}),
      };
      return isNew ? createOfferApi(body) : updateOfferApi(id as string, body);
    },
    onSuccess: () => navigate('/admin/offers'),
  });

  return (
    <div className="stack">
      <AdminPageHeader title={isNew ? 'Add offer page' : 'Edit offer page'} />
      <form className="card stack admin-form" onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate>
        <label className="field">
          <span className="field-label">Offer name</span>
          <input className="input" {...form.register('name')} placeholder="Goa summer sale" />
          {form.formState.errors.name ? <p className="field-error">{form.formState.errors.name.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">Slug</span>
          <input className="input" {...form.register('slug')} placeholder="goa-summer-sale" />
          <p className="field-hint">Public URL: /deals/your-slug</p>
          {form.formState.errors.slug ? <p className="field-error">{form.formState.errors.slug.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">Offer details</span>
          <textarea
            className="input"
            rows={5}
            {...form.register('description')}
            placeholder="Describe the deal, inclusions, fare notes, and any conditions travellers should know."
          />
          <p className="field-hint">Shown on the public deals page and offer detail page.</p>
          {form.formState.errors.description ? (
            <p className="field-error">{form.formState.errors.description.message}</p>
          ) : null}
        </label>
        <label className="field">
          <span className="field-label">Image URL</span>
          <input className="input" {...form.register('imageUrl')} placeholder="https://" />
          <p className="field-hint">Hero image for the deals listing and detail page.</p>
          {form.formState.errors.imageUrl ? <p className="field-error">{form.formState.errors.imageUrl.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">External offer link</span>
          <input className="input" {...form.register('offerLink')} placeholder="https://" />
          <p className="field-hint">Optional link travellers can open in addition to submitting an inquiry.</p>
          {form.formState.errors.offerLink ? <p className="field-error">{form.formState.errors.offerLink.message}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">Publish date</span>
          <input className="input" type="date" {...form.register('publishDate')} />
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select className="input" {...form.register('status')}>
            <option value={OFFER_PAGE_STATUSES.PUBLISH}>Publish</option>
            <option value={OFFER_PAGE_STATUSES.DRAFT}>Draft</option>
          </select>
          <p className="field-hint">Only published offers appear on the website.</p>
        </label>
        <label className="admin-check">
          <input type="checkbox" {...form.register('isShowPopup')} />
          Show as homepage popup
        </label>
        {save.error instanceof ApiClientError ? <p className="field-error">{save.error.message}</p> : null}
        <div className="admin-page-actions">
          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
          <Link to="/admin/offers" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};
