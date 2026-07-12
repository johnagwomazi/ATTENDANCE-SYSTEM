import { NavLink } from 'react-router-dom';
import { Badge } from '../ui/Badge';

export const Sidebar = ({ title = 'New Horizons', subtitle = 'Attendance Management', navItems = [] }) => {
  return (
<aside className="hidden w-[288px] shrink-0 border-r border-white/10 bg-[#005AA9] p-5 lg:flex lg:flex-col">
  <div className="mb-8 rounded-[28px] border border-white/20 bg-white p-5 shadow-soft">
    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F4C21A]">
      New Horizons
    </p>

    <h2 className="mt-3 text-xl font-extrabold text-slate-900">
      {title}
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {subtitle}
    </p>
  </div>

  <nav className="space-y-2">
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
          {item.icon ? (
            <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          ) : null}

          {item.label}
        </span>

        {item.badge ? (
          <Badge variant="orange">{item.badge}</Badge>
        ) : null}
      </NavLink>
    ))}
  </nav>
</aside>
  );
};
