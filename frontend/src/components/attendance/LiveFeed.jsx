import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatClock } from '../../utils/format';

export const LiveFeed = ({ items = [], title = 'Live Attendance' }) => {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-text">{title}</h3>
        <Badge variant="primary">{items.length} recent</Badge>
      </div>
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {items.length ? items.map((item, index) => (
            <motion.div
              key={`${item.studentName || item.student_name || index}-${item.time}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-border bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-text">{item.studentName || item.student_name}</p>
                  <p className="text-sm text-slate-500">{item.course}</p>
                </div>
                <Badge variant={item.status === 'late' ? 'orange' : 'success'}>{item.status}</Badge>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {formatClock(item.time || item.created_at)}
              </p>
            </motion.div>
          )) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-500">
              No live events yet.
            </div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
