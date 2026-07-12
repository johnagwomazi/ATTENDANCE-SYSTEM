import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { adminMoreNavItems } from '../../config/adminNavigation';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const getProfilePath = (role) => {
  if (role === 'student') return '/student/profile';
  if (role === 'manager') return '/manager/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/login';
};

export const AdminMoreSheet = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close more actions"
            className="absolute inset-0 h-full w-full bg-slate-950/35 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="More Actions"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-border bg-white shadow-[0_-18px_50px_rgba(15,23,42,0.16)]"
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          >
            <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200" />

            <div className="px-4 pb-4 pt-3">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Admin actions</p>
                  <h2 className="mt-1 text-lg font-extrabold text-text">More Actions</h2>
                </div>
                <Button variant="ghost" onClick={onClose} aria-label="Close more actions" className="focus-visible:ring-4 focus-visible:ring-primary/10">
                  Close
                </Button>
              </div>

              <div className="space-y-2">
                {adminMoreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

                  return (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive: navActive }) =>
                        `flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 ${
                          navActive || isActive
                            ? 'border-primary/20 bg-primary/10 text-primary'
                            : 'border-transparent text-slate-700 hover:border-border hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose?.();
                      navigate(getProfilePath(role || 'admin'));
                    }}
                    className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserRound className="h-5 w-5 shrink-0" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>

              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
