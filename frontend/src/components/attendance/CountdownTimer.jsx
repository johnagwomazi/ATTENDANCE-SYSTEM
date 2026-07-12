import { motion } from 'framer-motion';

export const CountdownTimer = ({ seconds }) => {
  return (
    <motion.div key={seconds} initial={{ scale: 1.04 }} animate={{ scale: 1 }} className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Refreshing in</p>
      <p className="mt-2 text-3xl font-black text-text">{seconds}s</p>
    </motion.div>
  );
};
