import { Badge } from '../ui/Badge';

export const Topbar = ({ title, subtitle, connected = null }) => {
  return (
    <header className="mb-6 flex flex-col gap-3 rounded-[28px] border border-border bg-surface p-4 shadow-soft">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
          {typeof connected === 'boolean' ? (
            <Badge variant={connected ? 'success' : 'default'}>{connected ? 'Live' : 'Offline'}</Badge>
          ) : null}
        </div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-text">{title}</h2>
      </div>
    </header>
  );
};
