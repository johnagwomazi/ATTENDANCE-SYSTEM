import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/shared/AppShell';
import { adminDesktopNavItems } from '../config/adminNavigation';
import { AdminMobileNav } from '../components/navigation/AdminMobileNav';

export const AdminLayout = ({ children }) => (
  <AppShell navItems={adminDesktopNavItems} mobileNav={<AdminMobileNav />}>
    {children || <Outlet />}
  </AppShell>
);
