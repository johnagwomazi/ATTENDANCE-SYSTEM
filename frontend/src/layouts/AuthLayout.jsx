import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[32px] border border-border bg-surface shadow-lift lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden flex-col justify-between bg-[radial-gradient(circle_at_top_right,_rgba(39,42,115,0.12),_transparent_35%),linear-gradient(180deg,#fff, #f8fafc)] p-6 lg:flex lg:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange">New Horizons</p>
            <h1 className="mt-4 max-w-md text-3xl font-black leading-[1.02] tracking-tight text-text sm:text-4xl lg:text-5xl">
              Attendance that feels calm, clear, and real-time.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-500">
              A premium attendance experience for students, managers, and administrators.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              ['Secure', 'HTTP-only auth'],
              ['Live', 'Socket.io events'],
              ['Smart', 'QR attendance flow']
            ].map(([label, helper]) => (
              <div key={label} className="rounded-[24px] border border-border bg-white p-4 shadow-soft">
                <p className="text-sm font-bold text-text">{label}</p>
                <p className="mt-1 text-xs text-slate-500">{helper}</p>
              </div>
            ))}
          </div>
        </aside>
        <main className="flex items-center justify-center p-4 sm:p-5 md:p-8">{children || <Outlet />}</main>
      </div>
    </div>
  );
};
