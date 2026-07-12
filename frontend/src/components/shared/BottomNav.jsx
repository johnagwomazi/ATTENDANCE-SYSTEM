import { NavLink } from 'react-router-dom';

export const BottomNav = ({ navItems = [] }) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-2">
        {navItems.slice(0, 4).map((item) => (
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
      </div>
    </nav>
  );
};
