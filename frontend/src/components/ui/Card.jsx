export const Card = ({ children, className = '' }) => (
  <div className={`rounded-[28px] border border-border bg-surface shadow-soft ${className}`}>
    {children}
  </div>
);
