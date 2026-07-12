import { useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { formatDate, formatTime } from '../../utils/format';

export default function AdminAttendance() {
  const { reports, fetchReports } = useAdminStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const summary = reports.today?.summary || {};
  const records = reports.today?.records || [];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Attendance overview</p>
        <h1 className="mt-3 text-3xl font-black text-text">Today's attendance</h1>
        <p className="mt-2 text-sm text-slate-500">A snapshot of present, late, and absent records.</p>
      </Card>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          ['Present', summary.presentCount || 0],
          ['Late', summary.lateCount || 0],
          ['Absent', summary.absentCount || 0],
          ['Percentage', `${summary.attendancePercentage || 0}%`]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-text">{value}</p>
          </Card>
        ))}
      </div>

      <Table
        columns={[
          { key: 'student', label: 'Student' },
          { key: 'course', label: 'Course' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'status', label: 'Status' }
        ]}
        rows={records}
        emptyMessage="No attendance records available for the selected period."
        renderRow={(row) => (
          <>
            <td className="px-5 py-4 font-semibold text-text">{row.student_name || row.student_id}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{row.course_name || row.course_id}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{formatDate(row.attendance_date)}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{formatTime(row.check_in_time)}</td>
            <td className="px-5 py-4"><Badge variant={row.status === 'late' ? 'orange' : row.status === 'present' ? 'success' : 'default'}>{row.status}</Badge></td>
          </>
        )}
      />
    </div>
  );
}
