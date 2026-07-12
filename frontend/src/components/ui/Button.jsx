import { forwardRef } from 'react';

const styles = {
  primary: 'bg-primary text-white hover:opacity-95 shadow-soft',
  secondary: 'bg-surface border border-border text-text hover:bg-slate-50',
  ghost: 'bg-transparent text-text hover:bg-slate-100',
  orange: 'bg-orange text-white hover:opacity-95'
};

export const Button = forwardRef(({ className = '', variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      type={props.type || 'button'}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
});

Button.displayName = 'Button';
