interface AdminStatusBadgeProps {
  value: string;
}

const tone = (value: string): string => {
  const key = value.toUpperCase();
  if (key === 'CONFIRMED' || key === 'PUBLISH' || key === 'ACTIVE' || key === 'ENABLE') {
    return 'ok';
  }
  if (key === 'CANCELLED' || key === 'FAILED' || key === 'CHARGEBACK' || key === 'DISABLE' || key === 'INACTIVE') {
    return 'danger';
  }
  if (key === 'PROCESSING' || key === 'FOLLOW_UP' || key === 'ASSIGNED' || key === 'DRAFT') {
    return 'warn';
  }
  return 'muted';
};

export const AdminStatusBadge = ({ value }: AdminStatusBadgeProps): JSX.Element => {
  return <span className={`admin-badge admin-badge-${tone(value)}`}>{value.replaceAll('_', ' ')}</span>;
};
