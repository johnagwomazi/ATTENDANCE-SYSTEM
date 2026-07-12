import { useEffect, useMemo, useState } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/format';
import { Button } from '../../components/ui/Button';

const pageSize = 8;

export default function History() {
  const { attendanceHistory, fetchHistory } = useAttendanceStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = useMemo(() => {
    return attendanceHistory.filter((item) => {
      const matchesQuery = [item.course, item.studentName, item.status]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = status === 'all' ? true : item.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [attendanceHistory, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Attendance History</p>
          <h1 className="mt-3 text-3xl font-black text-text">Search and review your records</h1>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} placeholder="Search by course or status" />
          <Select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
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
                <td className="px-5 py-4 text-sm font-medium text-text">{formatDate(item.date || item.created_at)}</td>
                <td className="px-5 py-4"><Badge variant={item.status === 'late' ? 'orange' : item.status === 'present' ? 'success' : 'default'}>{item.status}</Badge></td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatTime(item.time)}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{item.course || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">No matching records found.</td>
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
