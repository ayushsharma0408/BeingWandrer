import { useLogout } from '@features/auth';
import { useAppSelector } from '@shared/store';

interface AdminTopbarProps {
  onMenu: () => void;
}

export const AdminTopbar = ({ onMenu }: AdminTopbarProps): JSX.Element => {
  const user = useAppSelector((state) => state.user.current);
  const logout = useLogout('/login/admin');

  return (
    <header className="admin-topbar">
      <button type="button" className="btn btn-ghost admin-menu-btn" onClick={onMenu} aria-label="Open menu">
        Menu
      </button>
      <p className="admin-topbar-title">Operations console</p>
      <div className="admin-topbar-user">
        <span>
          {user?.fullName ?? user?.email}
          <small>{user?.role}</small>
        </span>
        <button type="button" className="btn btn-outline" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    </header>
  );
};
