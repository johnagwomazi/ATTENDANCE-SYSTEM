import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Ellipsis, LayoutDashboard, Users, ScanLine } from 'lucide-react';
import { adminMobileNavItems } from '../../config/adminNavigation';
import { AdminMoreSheet } from './AdminMoreSheet';

const fallbackIcon = {
  Dashboard: LayoutDashboard,
  Students: Users,
  Attendance: ScanLine
};

export const AdminMobileNav = () => {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {adminMobileNavItems.map((item) => {
            const Icon = item.icon || fallbackIcon[item.label] || LayoutDashboard;

            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-slate-500'
                  }`
                }
                end={item.end}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <button
            type="button"
            aria-label="Open more admin actions"
            aria-expanded={moreOpen}
            aria-controls="admin-more-sheet"
            onClick={() => setMoreOpen((value) => !value)}
            className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 ${
              moreOpen ? 'bg-primary/10 text-primary' : 'text-slate-500'
            }`}
          >
            <Ellipsis className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <div id="admin-more-sheet">
        <AdminMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      </div>
    </>
  );
};
