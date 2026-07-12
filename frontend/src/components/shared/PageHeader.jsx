import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const PageHeader = ({ eyebrow, title, description, action, children }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl space-y-2">
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">{eyebrow}</p> : null}
      <h1 className="text-3xl font-extrabold tracking-tight text-text md:text-4xl">{title}</h1>
      {description ? <p className="max-w-xl text-sm leading-7 text-slate-500 md:text-base">{description}</p> : null}
    </div>
    {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
    {children}
  </div>
);
