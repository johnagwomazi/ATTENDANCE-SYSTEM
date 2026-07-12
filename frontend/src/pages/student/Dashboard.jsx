import { useEffect } from 'react';
import { TrendingUp, Clock3, CalendarDays, BadgeCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Topbar } from '../../components/shared/Topbar';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/format';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { statistics, attendanceHistory, fetchStats, fetchHistory } = useAttendanceStore();

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, [fetchStats, fetchHistory]);

  const recent = attendanceHistory.slice(0, 4);

  return (
    <div className="space-y-6">
      <Topbar
        title={`Good Morning, ${user?.full_name || user?.fullName || 'Student'}`}
        subtitle="Student dashboard"
      />

      <PageHeader
        eyebrow="Overview"
        title="Your attendance at a glance"
        description="Track progress, review recent check-ins, and stay ready for your next class."
        action={<Button onClick={() => navigate('/student/attendance')}>Open Attendance</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present" value={statistics.present} icon={BadgeCheck} tone="success" index={0} />
        <StatCard label="Late" value={statistics.late} icon={Clock3} tone="orange" index={1} />
        <StatCard label="Absent" value={statistics.absent} icon={CalendarDays} tone="sky" index={2} />
        <StatCard label="Attendance Rate" value={`${statistics.attendancePercentage}%`} icon={TrendingUp} tone="primary" index={3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-text">Program status</h3>
              <p className="text-sm text-slate-500">Enrollment details and schedule snapshot.</p>
            </div>
            <Badge variant="primary">Active</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Course</p>
              <p className="mt-2 font-bold text-text">{user?.course || 'Assigned by administration'}</p>
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Schedule</p>
              <p className="mt-2 font-bold text-text">{user?.schedule || 'Check your QR display schedule'}</p>
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Program</p>
              <p className="mt-2 font-bold text-text">{user?.program_status || 'Active'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <h3 className="text-lg font-extrabold text-text">Recent check-ins</h3>
            <p className="text-sm text-slate-500">Latest locally tracked attendance events.</p>
          </div>
          <div className="space-y-3">
            {recent.length ? recent.map((item) => (
              <div key={`${item.id}-${item.date}`} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{item.course || 'Attendance'}</p>
                    <p className="text-sm text-slate-500">{formatDate(item.date)}</p>
                  </div>
                  <Badge variant={item.status === 'late' ? 'orange' : 'success'}>{item.status}</Badge>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {formatTime(item.time)}
                </p>
              </div>
            )) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-500">
                No check-ins yet. Scan a QR code to start.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
