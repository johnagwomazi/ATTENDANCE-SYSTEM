import { Card } from '../ui/Card';

export const EmptyState = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-border bg-slate-50/60 px-5 py-10 text-center sm:px-6 sm:py-12">
      <p className="text-lg font-semibold text-text">{title}</p>
      <p className="max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
};
