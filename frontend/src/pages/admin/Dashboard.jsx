import { useEffect } from 'react';
import { BookOpen, ClipboardList, Users, BadgeCheck } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { Topbar } from '../../components/shared/Topbar';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';

export default function AdminDashboard() {
  const { students, courses, enrollments, reports, fetchStudents, fetchCourses, fetchEnrollments, fetchReports } = useAdminStore();

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchEnrollments();
    fetchReports();
  }, [fetchStudents, fetchCourses, fetchEnrollments, fetchReports]);

  const summary = reports.today?.summary || {};

  return (
    <div className="space-y-1">
      <Topbar
        title="Admin control center"
        subtitle="Enterprise dashboard"
        connected
      />

      <PageHeader
        eyebrow="Command"
        title="Operate the institute with confidence"
        description="Overview cards, enrollments, attendance, and reporting all in one polished workspace."
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={students.length} icon={Users} tone="primary" index={0} />
        <StatCard label="Courses" value={courses.length} icon={BookOpen} tone="sky" index={1} />
        <StatCard label="Attendance" value={summary.totalAttendance || enrollments.length || 0} icon={ClipboardList} tone="orange" index={2} />
        <StatCard label="Managers" value={1} icon={BadgeCheck} tone="success" index={3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-text">Latest enrollments</h3>
              <p className="text-sm text-slate-500">Most recent active program entries.</p>
            </div>
            <Badge variant="primary">{enrollments.length} total</Badge>
          </div>
          <div className="space-y-3">
            {enrollments.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-text">{item.student_name}</p>
                  <p className="text-sm text-slate-500">{item.course_name}</p>
                </div>
                <Badge variant={item.enrollment_status === 'completed' ? 'default' : 'success'}>{item.enrollment_status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-extrabold text-text">Quick summary</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-border bg-slate-50 p-4">Present today: {summary.presentCount || 0}</div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">Late today: {summary.lateCount || 0}</div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">Absent today: {summary.absentCount || 0}</div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">Updated: {formatDate(new Date())}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
