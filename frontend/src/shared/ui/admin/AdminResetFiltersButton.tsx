interface AdminResetFiltersButtonProps {
  onReset: () => void;
  disabled?: boolean;
}

export const AdminResetFiltersButton = ({ onReset, disabled = false }: AdminResetFiltersButtonProps): JSX.Element => {
  return (
    <button type="button" className="btn btn-ghost" disabled={disabled} onClick={onReset}>
      Reset filters
    </button>
  );
};
