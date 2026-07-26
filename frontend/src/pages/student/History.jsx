import { useEffect, useMemo, useState } from 'react';
import { studentService } from '../../services/studentService';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { AttendanceBadge } from '../../components/shared/AttendanceBadge';

const pageSize = 8;

export default function History() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendancePercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const params = {
          search: query.trim() || null,
          status: status === 'all' ? null : status
        };
        const response = await studentService.fetchAttendanceHistory(params);
        const nextRecords = response?.data?.records || response?.records || [];
        const nextSummary = response?.data?.summary || response?.summary || {};

        if (!active) return;

        setRecords(nextRecords);
        setSummary({
          presentCount: nextSummary.presentCount || 0,
          lateCount: nextSummary.lateCount || 0,
          absentCount: nextSummary.absentCount || 0,
          attendancePercentage: nextSummary.attendancePercentage || 0
        });
        setPage(1);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [query, status]);

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const current = useMemo(() => records.slice((page - 1) * pageSize, page * pageSize), [page, records]);

  return (
    <Card className="p-5 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Attendance History</p>
          <h1 className="mt-3 text-2xl font-black text-text sm:text-3xl">Search and review your records</h1>
          <p className="mt-2 text-sm text-slate-500">
            Present: {summary.presentCount || 0} | Late: {summary.lateCount || 0} | Absent: {summary.absentCount || 0} | {summary.attendancePercentage || 0}%
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by course or status"
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-slate-50">
            <tr>
              {['Date', 'Status', 'Time', 'Course'].map((label) => (
                <th key={label} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {current.length ? current.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-4 text-sm font-medium text-text sm:px-5">{formatDate(item.date || item.attendance_date || item.created_at)}</td>
                <td className="px-5 py-4">
                  <AttendanceBadge status={item.status} isLate={item.is_late || item.isLate} />
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">{formatTime(item.time || item.check_in_time)}</td>
                <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">{item.course || item.course_name || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                  {loading ? 'Loading attendance history...' : 'No matching records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>
    </Card>
  );
}
