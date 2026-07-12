import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Ellipsis, LogOut, UserRound } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const BottomNav = ({ navItems = [] }) => {
  const navigate = useNavigate();
  const { logout, role } = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const profilePath = role === 'student' ? '/student/profile' : '/manager/dashboard';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 py-2 backdrop-blur md:hidden">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(navItems.slice(0, 3).length + 1, 4)}, minmax(0, 1fr))` }}
      >
        {navItems.slice(0, 3).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                isActive ? 'bg-primary/10 text-primary' : 'text-slate-500'
              }`
            }
            end={item.end}
          >
            {item.icon ? <item.icon className="h-5 w-5" /> : null}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          aria-label="Open more actions"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-sheet"
          onClick={() => setMoreOpen((value) => !value)}
          className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 ${
            moreOpen ? 'bg-primary/10 text-primary' : 'text-slate-500'
          }`}
        >
          <Ellipsis className="h-5 w-5" />
          <span>More</span>
        </button>
      </div>

      <AnimatePresence>
        {moreOpen ? (
          <motion.div
            id="mobile-more-sheet"
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close more actions"
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
              onClick={() => setMoreOpen(false)}
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

              <div className="px-4 pb-4 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Account</p>
                    <h2 className="mt-1 text-lg font-extrabold text-text">More Actions</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMoreOpen(false)}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      navigate(profilePath);
                    }}
                    className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserRound className="h-5 w-5 shrink-0" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setMoreOpen(false);
                      await handleLogout();
                    }}
                    className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
};
