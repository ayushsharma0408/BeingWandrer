import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export const AdminLayout = (): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      {open ? <button type="button" className="admin-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <div className="admin-main">
        <AdminTopbar onMenu={() => setOpen(true)} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
