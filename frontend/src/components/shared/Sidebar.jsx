import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const getProfilePath = (role) => {
  if (role === 'student') return '/student/profile';
  if (role === 'manager') return '/manager/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/login';
};

const UserFooter = ({ onNavigate, onLogout }) => {
  const { user, role } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.full_name || user?.fullName || 'Guest';
  const email = user?.email || 'No email';
  const roleLabel = role || user?.role || 'student';

  const profileItems = useMemo(() => ([
    {
      label: 'My Profile',
      icon: UserRound,
      onClick: () => {
        setMenuOpen(false);
        onNavigate(getProfilePath(roleLabel));
      }
    }
  ]), [onNavigate, roleLabel]);

  return (
    <div className="border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-3xl border border-white/15 bg-white/10 px-4 py-3 text-left transition hover:bg-white/15"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{displayName}</p>
          <p className="truncate text-xs text-white/70">{email}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 space-y-2"
          >
            <div className="space-y-2">
              {profileItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <Button
                variant="secondary"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full justify-start border-white/10 bg-white/10 text-white hover:bg-white/15"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </motion.div>
        ) : (
          null
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar = ({ title = 'New Horizons', subtitle = 'Attendance Management', navItems = [] }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-8 rounded-[28px] border border-white/20 bg-white p-5 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F4C21A]">New Horizons</p>
        <h2 className="mt-3 text-xl font-extrabold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'border-white/20 bg-white text-[#005AA9] shadow-lg'
                  : 'border-transparent text-white/85 hover:border-white/15 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-3">
              {item.icon ? <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" /> : null}
              {item.label}
            </span>

            {item.badge ? <Badge variant="orange">{item.badge}</Badge> : null}
          </NavLink>
        ))}
      </nav>

      <UserFooter onNavigate={handleNavigate} onLogout={handleLogout} />
    </div>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[288px] shrink-0 flex-col border-r border-white/10 bg-[#005AA9] p-5 lg:flex">
        {sidebarContent}
      </aside>
    </>
  );
};
