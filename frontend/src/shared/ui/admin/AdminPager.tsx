interface AdminPagerProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const AdminPager = ({ page, totalPages, total, onPageChange }: AdminPagerProps): JSX.Element => {
  return (
    <div className="admin-pager">
      <p className="muted">
        {total} record{total === 1 ? '' : 's'}
      </p>
      <div className="admin-pager-btns">
        <button type="button" className="btn btn-outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>
          {page} / {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          className="btn btn-outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
