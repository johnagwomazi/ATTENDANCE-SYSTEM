import { Card } from '../ui/Card';
import { motion } from 'framer-motion';

export const StatCard = ({ label, value, helper, icon: Icon, tone = 'primary', index = 0 }) => {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    orange: 'bg-orange/10 text-orange',
    sky: 'bg-sky/20 text-sky-950',
    success: 'bg-emerald-100 text-emerald-700'
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-text">{value}</p>
            {helper ? <p className="mt-2 text-xs font-medium text-slate-400">{helper}</p> : null}
          </div>
          {Icon ? (
            <div className={`rounded-2xl p-3 ${tones[tone]}`}>
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
};
