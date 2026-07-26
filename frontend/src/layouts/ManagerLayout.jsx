import { LayoutDashboard, Radio } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/shared/AppShell';

const navItems = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manager/live-attendance', label: 'Live', icon: Radio }
];

export const ManagerLayout = ({ children }) => <AppShell navItems={navItems}>{children || <Outlet />}</AppShell>;
