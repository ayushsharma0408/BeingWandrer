export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) {
    return '—';
  }
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) {
    return '—';
  }
  return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' });
};
