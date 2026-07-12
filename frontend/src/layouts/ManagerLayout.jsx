import { LayoutDashboard, Radio, QrCode } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/shared/AppShell';

const navItems = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manager/live-attendance', label: 'Live', icon: Radio },
  { to: '/qr-display', label: 'QR Display', icon: QrCode }
];

export const ManagerLayout = ({ children }) => <AppShell navItems={navItems}>{children || <Outlet />}</AppShell>;
