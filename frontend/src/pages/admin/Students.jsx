import { useEffect, useMemo, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../utils/format';

const statusVariant = {
  active: 'success',
  expired: 'warning',
  completed: 'primary',
  suspended: 'danger'
};

export default function Students() {
  const { enrolledStudents, fetchEnrolledStudents } = useAdminStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchEnrolledStudents();
  }, [fetchEnrolledStudents]);

  const filteredStudents = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return enrolledStudents;
    }

    return enrolledStudents.filter((student) => {
      const fullName = String(student.fullName || '').toLowerCase();
      const email = String(student.email || '').toLowerCase();
      return fullName.includes(search) || email.includes(search);
    });
  }, [enrolledStudents, query]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Student management</p>
            <h1 className="mt-3 text-3xl font-black text-text">Students</h1>
            <p className="mt-2 text-sm text-slate-500">Review enrolled students and their current program status.</p>
          </div>
          <Badge variant="primary">{filteredStudents.length} students</Badge>
        </div>

        <div className="mt-5 max-w-md">
          <Input
            label="Search students"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
          />
        </div>
      </Card>

      <Table
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'course', label: 'Course' },
          { key: 'status', label: 'Status' },
          { key: 'start', label: 'Start Date' },
          { key: 'end', label: 'End Date' }
        ]}
        rows={filteredStudents}
        emptyMessage="No enrolled students match your search."
        renderRow={(row) => (
          <>
            <td className="px-5 py-4 font-semibold text-text">{row.fullName}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{row.email}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{row.phone}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{row.courseName}</td>
            <td className="px-5 py-4">
              <Badge variant={statusVariant[row.status] || 'default'} className="capitalize">
                {row.status}
              </Badge>
            </td>
            <td className="px-5 py-4 text-sm text-slate-600">{formatDate(row.programStartDate)}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{formatDate(row.programEndDate)}</td>
          </>
        )}
      />
    </div>
  );
}
