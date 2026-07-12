import { useEffect, useState } from 'react';
import { BadgeCheck, CalendarDays, Clock3, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { studentService } from '../../services/studentService';
import { Topbar } from '../../components/shared/Topbar';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/format';

const statusVariant = {
  active: 'success',
  inactive: 'warning',
  unassigned: 'default'
};

const attendanceVariant = {
  present: 'success',
  late: 'orange',
  absent: 'danger'
};

const emptyOverview = {
  student: null,
  enrollments: [],
  activeEnrollments: [],
  status: 'unassigned',
  programStartDate: null,
  programEndDate: null
};

const emptySummary = {
  presentCount: 0,
  lateCount: 0,
  absentCount: 0,
  attendancePercentage: 0
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [overview, setOverview] = useState(emptyOverview);
  const [summary, setSummary] = useState(emptySummary);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const [dashboardResponse, summaryResponse, historyResponse] = await Promise.all([
          studentService.fetchDashboard(),
          studentService.fetchAttendanceSummary(),
          studentService.fetchAttendanceHistory()
        ]);

        if (!mounted) return;

        setOverview(dashboardResponse?.data || dashboardResponse || emptyOverview);
        setSummary(summaryResponse?.data?.data?.summary || summaryResponse?.data?.summary || summaryResponse?.summary || emptySummary);
        setRecentAttendance((historyResponse?.data?.data?.records || historyResponse?.data?.records || historyResponse?.records || []).slice(0, 4));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const enrollments = overview.enrollments || [];
  const activeEnrollments = overview.activeEnrollments || [];

  return (
    <div className="space-y-6">
      <Topbar
        title={`Good Morning, ${user?.full_name || user?.fullName || 'Student'}`}
        subtitle="Student dashboard"
      />

      <PageHeader
        eyebrow="Overview"
        title="Your courses, schedules, and attendance"
        description="See every active course, its weekly timetable, and your current program status in one place."
        action={<Button onClick={() => navigate('/student/attendance')}>Open Attendance</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present" value={summary.presentCount || 0} icon={BadgeCheck} tone="success" index={0} />
        <StatCard label="Late" value={summary.lateCount || 0} icon={Clock3} tone="orange" index={1} />
        <StatCard label="Absent" value={summary.absentCount || 0} icon={CalendarDays} tone="sky" index={2} />
        <StatCard label="Attendance Rate" value={`${summary.attendancePercentage || 0}%`} icon={TrendingUp} tone="primary" index={3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-text">Program status</h3>
              <p className="text-sm text-slate-500">Enrollment details and weekly schedule snapshot.</p>
            </div>
            <Badge variant={statusVariant[overview.status] || 'default'} className="capitalize">
              {overview.status}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-2 font-bold text-text">{(overview.status || 'unassigned').toUpperCase()}</p>
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Program Start</p>
              <p className="mt-2 font-bold text-text">{formatDate(overview.programStartDate)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Program End</p>
              <p className="mt-2 font-bold text-text">{formatDate(overview.programEndDate)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Enrolled courses</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {enrollments.length ? enrollments.map((enrollment) => (
                <Badge key={enrollment.enrollmentId} variant={enrollment.status === 'active' ? 'success' : 'warning'}>
                  {enrollment.courseName}
                </Badge>
              )) : (
                <Badge variant="default">No courses assigned yet</Badge>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <h3 className="text-lg font-extrabold text-text">Schedules</h3>
            <p className="text-sm text-slate-500">Each course can have one or more class days.</p>
          </div>

          <div className="space-y-4">
            {enrollments.length ? enrollments.map((enrollment) => (
              <div key={enrollment.enrollmentId} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{enrollment.courseName}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {formatDate(enrollment.programStartDate)} - {formatDate(enrollment.programEndDate)}
                    </p>
                  </div>
                  <Badge variant={enrollment.status === 'active' ? 'success' : 'warning'} className="capitalize">
                    {enrollment.status}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2">
                  {(enrollment.schedules || []).length ? enrollment.schedules.map((schedule) => (
                    <div key={`${enrollment.enrollmentId}-${schedule.id || schedule.dayOfWeek}-${schedule.startTime}`} className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-sm font-semibold text-text">{schedule.dayOfWeek}</p>
                      <p className="text-sm text-slate-500">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </p>
                    </div>
                  )) : (
                    <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500">No schedule attached yet.</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-8 text-center text-sm text-slate-500">
                {loading ? 'Loading your dashboard...' : 'You are not enrolled in any course yet.'}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <div className="mb-5">
            <h3 className="text-lg font-extrabold text-text">Active course summary</h3>
            <p className="text-sm text-slate-500">A quick snapshot of what is live right now.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {activeEnrollments.length ? activeEnrollments.map((enrollment) => (
              <div key={enrollment.enrollmentId} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{enrollment.courseName}</p>
                    <p className="text-xs text-slate-500">{formatDate(enrollment.programStartDate)} - {formatDate(enrollment.programEndDate)}</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">{(enrollment.schedules || []).length} schedule block(s)</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-8 text-center text-sm text-slate-500 md:col-span-2">
                No active course yet.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <h3 className="text-lg font-extrabold text-text">Recent attendance</h3>
            <p className="text-sm text-slate-500">Your latest recorded check-ins.</p>
          </div>
          <div className="space-y-3">
            {recentAttendance.length ? recentAttendance.map((item) => (
              <div key={`${item.id}-${item.attendance_date}`} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{item.course_name || 'Attendance'}</p>
                    <p className="text-sm text-slate-500">{formatDate(item.attendance_date)}</p>
                  </div>
                  <Badge variant={attendanceVariant[item.status] || 'default'} className="capitalize">
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Check-in: {item.check_in_time ? formatTime(item.check_in_time) : '-'}
                </p>
              </div>
            )) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-500">
                No recent check-ins yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
