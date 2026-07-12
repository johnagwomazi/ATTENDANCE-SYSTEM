import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Topbar = ({ user, onLogout, title, subtitle, action, connected = false }) => {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-4 shadow-soft md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
          <Badge variant={connected ? 'success' : 'default'}>{connected ? 'Live' : 'Offline'}</Badge>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-text">{title}</h2>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {action}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-3 py-2">
          <div className="h-10 w-10 rounded-full bg-primary/10" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text">{user?.full_name || user?.fullName || 'Guest'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'student'}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={onLogout} className="hidden md:inline-flex">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};
