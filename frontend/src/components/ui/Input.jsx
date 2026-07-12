import { forwardRef } from 'react';

export const Input = forwardRef(({ label, className = '', error, ...props }, ref) => {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        ref={ref}
        className={`w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 ${className}`}
        {...props}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </label>
  );
});

Input.displayName = 'Input';
