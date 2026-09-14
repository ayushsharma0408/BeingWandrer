import { NavLink } from 'react-router-dom';
import { ADMIN_NAV } from './admin-nav';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ open, onClose }: AdminSidebarProps): JSX.Element => {
  return (
    <aside className={open ? 'admin-sidebar is-open' : 'admin-sidebar'}>
      <NavLink to="/admin" className="admin-brand" onClick={onClose}>
        <img src="/brand/best-in-flights-logo.png" alt="Best in Flights" width={160} height={34} />
        <span>Admin</span>
      </NavLink>
      <nav>
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            className={({ isActive }) => (isActive ? 'admin-nav-link is-active' : 'admin-nav-link')}
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
