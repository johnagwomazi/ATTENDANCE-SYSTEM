import { LayoutDashboard, Users, BookOpen, ClipboardList, ScanLine, BarChart3, QrCode } from 'lucide-react';

export const adminNavigationItems = [
  {
    key: 'dashboard',
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    section: 'primary',
    mobileVisible: true,
    mobileOrder: 1
  },
  {
    key: 'students',
    to: '/admin/students',
    label: 'Students',
    icon: Users,
    section: 'primary',
    mobileVisible: true,
    mobileOrder: 2
  },
  {
    key: 'courses',
    to: '/admin/courses',
    label: 'Courses',
    icon: BookOpen,
    section: 'more',
    mobileVisible: false
  },
  {
    key: 'enrollments',
    to: '/admin/enrollments',
    label: 'Enrollments',
    icon: ClipboardList,
    section: 'more',
    mobileVisible: false
  },
  {
    key: 'attendance',
    to: '/admin/attendance',
    label: 'Attendance',
    icon: ScanLine,
    section: 'primary',
    mobileVisible: true,
    mobileOrder: 3
  },
  {
    key: 'reports',
    to: '/admin/reports',
    label: 'Reports',
    icon: BarChart3,
    section: 'more',
    mobileVisible: false
  },
  {
    key: 'qr-display',
    to: '/qr-display',
    label: 'QR Display',
    icon: QrCode,
    section: 'more',
    mobileVisible: false
  }
];

export const adminDesktopNavItems = adminNavigationItems;
export const adminMobileNavItems = adminNavigationItems
  .filter((item) => item.mobileVisible)
  .sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0));
export const adminMoreNavItems = adminNavigationItems.filter((item) => item.section === 'more');
