import { LayoutDashboard, ScanLine, UserRound, History } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/shared/AppShell';

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/attendance', label: 'Attendance', icon: ScanLine },
  { to: '/student/profile', label: 'Profile', icon: UserRound },
  { to: '/student/history', label: 'History', icon: History }
];

export const StudentLayout = ({ children }) => <AppShell navItems={navItems}>{children || <Outlet />}</AppShell>;
