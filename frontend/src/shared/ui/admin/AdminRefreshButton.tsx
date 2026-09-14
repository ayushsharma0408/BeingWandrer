import { MdRefresh } from 'react-icons/md';

interface AdminRefreshButtonProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AdminRefreshButton = ({ onRefresh, isRefreshing = false }: AdminRefreshButtonProps): JSX.Element => {
  return (
    <button
      type="button"
      className="btn btn-outline"
      disabled={isRefreshing}
      onClick={onRefresh}
      aria-label="Refresh"
    >
      <MdRefresh aria-hidden className={isRefreshing ? 'admin-refresh-spin' : undefined} />
      {isRefreshing ? 'Refreshing…' : 'Refresh'}
    </button>
  );
};
