import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const AttendanceResult = ({ result }) => {
  if (!result) return null;

  if (result.type === 'success') {
    return (
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto max-w-xl">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h3 className="mt-6 text-2xl font-extrabold text-text">Attendance Recorded</h3>
          <p className="mt-2 text-sm text-slate-500">{result.message}</p>
          <div className="mt-6 grid gap-3 text-left md:grid-cols-2">
            {[
              ['Student Name', result.record?.studentName],
              ['Course', result.record?.course],
              ['Time', result.record?.time],
              ['Status', result.record?.status]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-bold text-text">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    );
  }

  if (result.type === 'expired_program') {
    return (
      <Card className="mx-auto max-w-xl p-8">
        <div className="flex items-center gap-3 text-orange">
          <AlertTriangle className="h-6 w-6" />
          <p className="text-sm font-bold uppercase tracking-[0.2em]">Program ended</p>
        </div>
        <h3 className="mt-5 text-3xl font-extrabold text-text">Your program has ended.</h3>
        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
          Please contact administration if you believe this is an error.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl p-8">
      <div className="flex items-center gap-3 text-red-600">
        <XCircle className="h-6 w-6" />
        <p className="text-sm font-bold uppercase tracking-[0.2em]">Attendance blocked</p>
      </div>
      <h3 className="mt-5 text-3xl font-extrabold text-text">{result.message || 'You do not have a class today.'}</h3>
      <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
        Try again when your scheduled class is active, or speak with the administration team.
      </p>
    </Card>
  );
};
