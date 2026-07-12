import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Filter, X } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { adminService } from '../../services/adminService';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
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

const emptyHistoryState = {
  summary: {
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendancePercentage: 0
  },
  records: [],
  range: null,
  filters: {}
};

export default function Students() {
  const { students, fetchStudents } = useAdminStore();
  const [query, setQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState(emptyHistoryState);
  const [attendanceFilters, setAttendanceFilters] = useState({
    courseId: 'all',
    from: '',
    to: '',
    status: 'all'
  });

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const courseOptions = useMemo(() => {
    const uniqueCourses = new Map();

    students.forEach((student) => {
      (student.enrollments || []).forEach((enrollment) => {
        if (!uniqueCourses.has(enrollment.courseId)) {
          uniqueCourses.set(enrollment.courseId, enrollment.courseName);
        }
      });
    });

    return Array.from(uniqueCourses.entries()).map(([id, name]) => ({ id, name }));
  }, [students]);

  const filteredStudents = useMemo(() => {
    const search = query.trim().toLowerCase();

    return students.filter((student) => {
      const fullName = String(student.fullName || student.full_name || '').toLowerCase();
      const email = String(student.email || '').toLowerCase();
      const courseSummary = String(student.courseSummary || student.activeCourseNames?.join(', ') || '').toLowerCase();
      const matchesSearch = !search || fullName.includes(search) || email.includes(search) || courseSummary.includes(search);
      const matchesCourse =
        selectedCourse === 'all' ||
        (student.enrollments || []).some((enrollment) => enrollment.courseId === selectedCourse);

      return matchesSearch && matchesCourse;
    });
  }, [students, query, selectedCourse]);

  const openAttendanceHistory = async (student) => {
    setSelectedStudent(student);
    setAttendanceOpen(true);
    setAttendanceLoading(true);
    setAttendanceReport(emptyHistoryState);

    const defaultCourseId = student?.enrollments?.[0]?.courseId || 'all';
    const nextFilters = {
      courseId: defaultCourseId,
      from: '',
      to: '',
      status: 'all'
    };

    setAttendanceFilters(nextFilters);

    try {
      const response = await adminService.fetchStudentAttendance(student.id, {
        courseId: defaultCourseId === 'all' ? null : defaultCourseId
      });
      setAttendanceReport(response?.data || response || emptyHistoryState);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const closeAttendanceHistory = () => {
    setAttendanceOpen(false);
    setSelectedStudent(null);
    setAttendanceLoading(false);
    setAttendanceReport(emptyHistoryState);
    setAttendanceFilters({
      courseId: 'all',
      from: '',
      to: '',
      status: 'all'
    });
  };

  const applyAttendanceFilters = async () => {
    if (!selectedStudent) return;

    setAttendanceLoading(true);
    try {
      const params = {
        courseId: attendanceFilters.courseId && attendanceFilters.courseId !== 'all' ? attendanceFilters.courseId : null,
        from: attendanceFilters.from || null,
        to: attendanceFilters.to || null,
        status: attendanceFilters.status && attendanceFilters.status !== 'all' ? attendanceFilters.status : null
      };
      const response = await adminService.fetchStudentAttendance(selectedStudent.id, params);
      setAttendanceReport(response?.data || response || emptyHistoryState);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const summary = attendanceReport?.summary || emptyHistoryState.summary;
  const attendanceRecords = attendanceReport?.records || [];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Student management</p>
              <h1 className="mt-3 text-3xl font-black text-text">Students</h1>
              <p className="mt-2 text-sm text-slate-500">
                Review enrolled students, their course load, and attendance history from one place.
              </p>
            </div>
            <Badge variant="primary">{filteredStudents.length} students</Badge>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                label="Search students"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email, or course"
              />
            </div>
            <div className="w-full md:w-[280px]">
              <Select
                label="Course"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
              >
                <option value="all">All Courses</option>
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
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
                        <h2 className="truncate text-lg font-extrabold text-text">{student.fullName || student.full_name}</h2>
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
                      {(student.activeCourseNames || []).length ? (
                        student.activeCourseNames.map((course) => (
                          <Badge key={`${student.id}-${course}`} variant="primary">
                            {course}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="default">No active course</Badge>
                      )}
                    </div>

                    <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                        <p className="mt-1 font-medium text-text">{formatDate(student.programStartDate || student.latestProgramStartDate)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">End Date</p>
                        <p className="mt-1 font-medium text-text">{formatDate(student.programEndDate || student.latestProgramEndDate)}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button variant="secondary" onClick={() => openAttendanceHistory(student)} className="w-full">
                        Attendance
                      </Button>
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
            { key: 'courses', label: 'Courses' },
            { key: 'status', label: 'Status' },
            { key: 'attendance', label: 'Attendance History' }
          ]}
          rows={filteredStudents}
          emptyMessage="No students found. Try adjusting your search or course filter."
          renderRow={(row) => (
            <>
              <td className="px-5 py-4 font-semibold text-text">{row.fullName || row.full_name}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{row.email}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{row.phone}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{row.courseSummary || row.activeCourseNames?.join(', ') || '-'}</td>
              <td className="px-5 py-4">
                <Badge variant={statusVariant[row.status] || 'default'} className="capitalize">
                  {row.status}
                </Badge>
              </td>
              <td className="px-5 py-4">
                <Button variant="secondary" onClick={() => openAttendanceHistory(row)}>
                  View Attendance
                </Button>
              </td>
            </>
          )}
        />
      </div>

      <AnimatePresence>
        {attendanceOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-0 md:items-center md:px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close attendance history"
              className="absolute inset-0 h-full w-full cursor-default bg-transparent"
              onClick={closeAttendanceHistory}
            />

            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Attendance history"
              className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-white shadow-[0_-18px_50px_rgba(15,23,42,0.16)] md:max-w-5xl md:rounded-[28px]"
              initial={{ y: 36, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 36, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            >
              <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200 md:hidden" />

              <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 md:px-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Attendance history</p>
                  <h2 className="mt-1 text-lg font-extrabold text-text">
                    {selectedStudent?.fullName || selectedStudent?.full_name || 'Student'}
                  </h2>
                  <p className="text-sm text-slate-500">{selectedStudent?.email || ''}</p>
                </div>
                <Button variant="ghost" onClick={closeAttendanceHistory} aria-label="Close attendance history">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
                <div className="grid gap-3 md:grid-cols-4">
                  <Card className="p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Present Days</p>
                    <p className="mt-2 text-2xl font-black text-text">{summary.presentCount || 0}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Absent Days</p>
                    <p className="mt-2 text-2xl font-black text-text">{summary.absentCount || 0}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Late Days</p>
                    <p className="mt-2 text-2xl font-black text-text">{summary.lateCount || 0}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Attendance %</p>
                    <p className="mt-2 text-2xl font-black text-text">{summary.attendancePercentage || 0}%</p>
                  </Card>
                </div>

                <Card className="mt-4 p-4 md:p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1">
                      <Select
                        label="Course"
                        value={attendanceFilters.courseId}
                        onChange={(event) => setAttendanceFilters((current) => ({ ...current, courseId: event.target.value }))}
                      >
                        <option value="all">All Courses</option>
                        {(selectedStudent?.enrollments || []).map((enrollment) => (
                          <option key={enrollment.courseId} value={enrollment.courseId}>
                            {enrollment.courseName}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Select
                        label="Status"
                        value={attendanceFilters.status}
                        onChange={(event) => setAttendanceFilters((current) => ({ ...current, status: event.target.value }))}
                      >
                        <option value="all">All Statuses</option>
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Input
                        type="date"
                        label="From"
                        value={attendanceFilters.from}
                        onChange={(event) => setAttendanceFilters((current) => ({ ...current, from: event.target.value }))}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="date"
                        label="To"
                        value={attendanceFilters.to}
                        onChange={(event) => setAttendanceFilters((current) => ({ ...current, to: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button variant="orange" onClick={applyAttendanceFilters} disabled={attendanceLoading}>
                      <Filter className="h-4 w-4" />
                      {attendanceLoading ? 'Loading...' : 'Apply Filters'}
                    </Button>
                    <p className="text-sm text-slate-500">
                      {attendanceReport?.range?.fromDate ? `From ${formatDate(attendanceReport.range.fromDate)}` : 'Using default program range'}
                      {attendanceReport?.range?.toDate ? ` to ${formatDate(attendanceReport.range.toDate)}` : ''}
                    </p>
                  </div>
                </Card>

                <div className="mt-4 space-y-3">
                  {attendanceRecords.length ? attendanceRecords.map((record) => (
                    <div key={record.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text">{record.course_name || record.courseName}</p>
                          <p className="text-sm text-slate-500">{formatDate(record.attendance_date)}</p>
                        </div>
                        <Badge variant={attendanceVariant[record.status] || 'default'} className="capitalize">
                          {record.status}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        Check In Time: {record.check_in_time ? formatTime(record.check_in_time) : '-'}
                      </p>
                    </div>
                  )) : (
                    <Card className="border-dashed p-8 text-center">
                      <p className="text-sm text-slate-500">
                        {attendanceLoading ? 'Loading attendance records...' : 'No attendance records found for this student.'}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
