import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
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
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchEnrolledStudents();
  }, [fetchEnrolledStudents]);

  const courseOptions = useMemo(() => {
    const uniqueCourses = new Set();

    enrolledStudents.forEach((student) => {
      if (student.courseName) {
        uniqueCourses.add(student.courseName);
      }
    });

    return Array.from(uniqueCourses).sort((left, right) => left.localeCompare(right));
  }, [enrolledStudents]);

  const filteredStudents = useMemo(() => {
    const search = query.trim().toLowerCase();

    return enrolledStudents.filter((student) => {
      const fullName = String(student.fullName || '').toLowerCase();
      const email = String(student.email || '').toLowerCase();
      const matchesSearch = !search || fullName.includes(search) || email.includes(search);
      const matchesCourse = selectedCourse === 'all' || student.courseName === selectedCourse;

      return matchesSearch && matchesCourse;
    });
  }, [enrolledStudents, query, selectedCourse]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Student management</p>
              <h1 className="mt-3 text-3xl font-black text-text">Students</h1>
              <p className="mt-2 text-sm text-slate-500">Review enrolled students and their current program status.</p>
            </div>
            <Badge variant="primary">{filteredStudents.length} students</Badge>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                label="Search students"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or email"
              />
            </div>
            <div className="w-full md:w-[240px]">
              <Select
                label="Course"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
              >
                <option value="all">All Courses</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="block md:hidden">
        {filteredStudents.length ? (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <details key={student.studentId || student.id} className="group">
                <summary className="list-none">
                  <Card className="rounded-3xl border border-border bg-white p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-extrabold text-text">{student.fullName}</h2>
                        <p className="mt-1 truncate text-sm text-slate-500">{student.email}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={statusVariant[student.status] || 'default'} className="capitalize">
                          {student.status}
                        </Badge>
                        <ChevronDown className="mt-0.5 h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant="primary">{student.courseName || 'No course'}</Badge>
                    </div>

                    <div className="mt-4 text-xs cursor-pointer font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Tap to view more
                    </div>
                  </Card>
                </summary>

                <Card className="-mt-3 rounded-t-none rounded-b-3xl border border-t-0 border-border bg-white px-5 pb-5 pt-2 shadow-soft">
                  <div className="grid gap-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Phone</p>
                      <p className="mt-1 font-medium text-text">{student.phone || '-'}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Start Date</p>
                        <p className="mt-1 font-medium text-text">{formatDate(student.programStartDate)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">End Date</p>
                        <p className="mt-1 font-medium text-text">{formatDate(student.programEndDate)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </details>
            ))}
          </div>
        ) : (
          <Card className="rounded-3xl border border-dashed border-border bg-white p-8 text-center shadow-soft">
            <p className="text-lg font-semibold text-text">No students found</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">Try adjusting your search or course filter.</p>
          </Card>
        )}
      </div>

      <div className="hidden md:block">
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
          emptyMessage="No students found. Try adjusting your search or course filter."
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
    </div>
  );
}
