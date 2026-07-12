import { useEffect } from 'react';
import { useSocketStore } from '../../store/socketStore';
import { LiveFeed } from '../../components/attendance/LiveFeed';
import { Card } from '../../components/ui/Card';
import { useAdminStore } from '../../store/adminStore';
import { Badge } from '../../components/ui/Badge';

export default function LiveAttendance() {
  const { liveAttendance, expiredAttempts } = useSocketStore();
  const { fetchReports, reports } = useAdminStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const summary = reports.today?.summary || {};

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Live Monitoring</p>
            <h1 className="mt-3 text-3xl font-black text-text">Attendance feed</h1>
          </div>
          <Badge variant="primary">Realtime</Badge>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <LiveFeed items={liveAttendance} />
        <Card className="p-5">
          <h3 className="text-lg font-extrabold text-text">Latest alerts</h3>
          <div className="mt-4 space-y-3">
            {expiredAttempts.length ? expiredAttempts.map((item, index) => (
              <div key={`${item.studentName}-${index}`} className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="font-bold text-text">{item.studentName}</p>
                <p className="mt-1 text-sm text-slate-500">{item.course}</p>
              </div>
            )) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-500">
                Waiting for alerts.
              </p>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-border bg-slate-50 p-4">Present: {summary.presentCount || 0}</div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">Late: {summary.lateCount || 0}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
