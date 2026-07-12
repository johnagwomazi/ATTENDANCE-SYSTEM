import { useEffect } from 'react';
import { BellRing, CheckCircle2, Clock3, Users } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useSocketStore } from '../../store/socketStore';
import { useAuthStore } from '../../store/authStore';
import { Topbar } from '../../components/shared/Topbar';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { LiveFeed } from '../../components/attendance/LiveFeed';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { reports, fetchReports } = useAdminStore();
  const { liveAttendance, expiredAttempts } = useSocketStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const summary = reports.today?.summary || reports.today?.data?.summary || {
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    totalAttendance: 0,
    attendancePercentage: 0
  };

  const expected = summary.totalAttendance || summary.presentCount + summary.lateCount + summary.absentCount;

  return (
    <div className="space-y-6">
      <Topbar
        user={user}
        title="Live attendance control"
        subtitle="Manager dashboard"
        onLogout={async () => {
          await logout();
          toast.success('Logged out.');
          navigate('/login');
        }}
        connected
      />

      <PageHeader
        eyebrow="Realtime"
        title="Monitor attendance as it happens"
        description="Live feeds, expiration alerts, and daily performance at a glance."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present Today" value={summary.presentCount || 0} icon={CheckCircle2} tone="success" index={0} />
        <StatCard label="Late Today" value={summary.lateCount || 0} icon={Clock3} tone="orange" index={1} />
        <StatCard label="Absent Today" value={summary.absentCount || 0} icon={BellRing} tone="sky" index={2} />
        <StatCard label="Expected Today" value={expected || 0} icon={Users} tone="primary" index={3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <LiveFeed items={liveAttendance} title="Attendance recorded" />
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-extrabold text-text">Expired enrollment alerts</h3>
            <p className="text-sm text-slate-500">Attempts from students whose programs are no longer active.</p>
          </div>
          <div className="space-y-3">
            {expiredAttempts.length ? expiredAttempts.map((item, index) => (
              <div key={`${item.studentName}-${index}`} className="rounded-2xl border border-orange/20 bg-orange/5 p-4">
                <p className="text-sm font-bold text-text">{item.studentName}</p>
                <p className="mt-1 text-sm text-slate-600">{item.course || 'Unknown course'}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.time}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-500">
                No expired attempts yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
