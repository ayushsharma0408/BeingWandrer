export const ADMIN_NAV = [
  { to: '/admin', label: 'Home', end: true },
  { to: '/admin/staff', label: 'Staff' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/sessions', label: 'Logged in profiles' },
  { to: '/admin/activity', label: 'Activity logs' },
  { to: '/admin/offers', label: 'Offer pages' },
  { to: '/admin/search-records', label: 'Search records' },
  { to: '/admin/inquiries', label: 'Offer inquiries' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/routes', label: 'Routes' },
] as const;
