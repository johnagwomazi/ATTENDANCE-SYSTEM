import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EnrollmentForm } from '../../components/forms/EnrollmentForm';
import { formatDate } from '../../utils/format';

const defaultValues = {
  studentId: '',
  courseId: '',
  programStartDate: '',
  programEndDate: '',
  courseSchedules: [{ dayOfWeek: '', startTime: '', endTime: '' }]
};

const formatScheduleSummary = (schedules = []) => {
  if (!schedules.length) return 'No schedule added yet';
  return schedules
    .map((schedule) => `${schedule.dayOfWeek} ${schedule.startTime?.slice(0, 5)} - ${schedule.endTime?.slice(0, 5)}`)
    .join(' | ');
};

export default function Enrollments() {
  const {
    students,
    courses,
    enrollments,
    fetchStudents,
    fetchCourses,
    fetchEnrollments,
    createEnrollment
  } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchEnrollments();
  }, [fetchStudents, fetchCourses, fetchEnrollments]);

  const openEnrollModal = (student) => {
    setSelectedStudent(student);
    reset({
      ...defaultValues,
      studentId: student.id,
      courseSchedules: [{ dayOfWeek: '', startTime: '', endTime: '' }]
    });
    setValue('studentId', student.id, { shouldValidate: false });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelectedStudent(null);
    reset(defaultValues);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        courseSchedules: (values.courseSchedules || []).filter(
          (schedule) => schedule?.dayOfWeek && schedule?.startTime && schedule?.endTime
        )
      };

      await createEnrollment(payload);
      toast.success('Enrollment created successfully.');
      closeModal();
      await Promise.all([fetchStudents(), fetchEnrollments()]);
    } catch (error) {
      toast.error(error.message || 'Unable to create enrollment.');
    }
  });

  const selectedName = useMemo(() => selectedStudent?.fullName || selectedStudent?.full_name || '', [selectedStudent]);

  const availableStudents = useMemo(() => {
    return students
      .filter((student) => String(student.status || '').toLowerCase() === 'unassigned')
      .sort((left, right) => {
        const leftName = String(left.fullName || left.full_name || '').toLowerCase();
        const rightName = String(right.fullName || right.full_name || '').toLowerCase();
        return leftName.localeCompare(rightName);
      });
  }, [students]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Enrollment management</p>
            <h1 className="text-3xl font-black text-text">Enroll students into courses</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Select any student, choose a course, define the program dates, and attach one or more class day schedules.
            </p>
          </div>
          <Badge variant="primary">{availableStudents.length} students</Badge>
        </div>
      </Card>

      <div className="block md:hidden">
        {availableStudents.length ? (
          <div className="space-y-4">
            {availableStudents.map((student) => (
              <details key={student.studentId || student.id} className="group">
                <summary className="list-none">
                  <Card className="rounded-3xl border border-border bg-white p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-extrabold text-text">{student.fullName || student.full_name || '-'}</h2>
                        <p className="mt-1 truncate text-sm text-slate-500">{student.email}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="default" className="capitalize">
                          {student.status}
                        </Badge>
                        <ChevronDown className="mt-0.5 h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant="default">No active courses</Badge>
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
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Courses</p>
                      <p className="mt-1 font-medium text-text">
                        {student.courseSummary || student.activeCourseNames?.join(', ') || 'No active courses'}
                      </p>
                    </div>

                    <Button variant="orange" onClick={() => openEnrollModal(student)} className="w-full">
                      Enroll Student
                    </Button>
                  </div>
                </Card>
              </details>
            ))}
          </div>
        ) : (
          <Card className="rounded-3xl border border-dashed border-border bg-white p-8 text-center shadow-soft">
            <p className="text-lg font-semibold text-text">No students available</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">Only students with unassigned status appear here.</p>
          </Card>
        )}
      </div>

      <div className="hidden md:block">
        <Table
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'courses', label: 'Enrolled Courses' },
            { key: 'status', label: 'Status' },
            { key: 'action', label: 'Action' }
          ]}
          rows={availableStudents}
          emptyMessage="No students are available."
          renderRow={(row) => (
            <>
              <td className="px-5 py-4 font-semibold text-text">{row.fullName || row.full_name || '-'}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{row.email}</td>
              <td className="px-5 py-4 text-sm text-slate-600">
                {row.courseSummary || row.activeCourseNames?.join(', ') || 'No active courses'}
              </td>
              <td className="px-5 py-4">
                <Badge variant="default" className="capitalize">
                  {row.status}
                </Badge>
              </td>
              <td className="px-5 py-4">
                <Button variant="orange" onClick={() => openEnrollModal(row)}>
                  Enroll
                </Button>
              </td>
            </>
          )}
        />
      </div>

<Modal
  open={open}
  title={selectedStudent ? `Enroll ${selectedName}` : 'Enroll student'}
  onClose={closeModal}
  footer={null}
>
  <div className="max-h-[80vh] overflow-y-auto pr-2">
    <div className="mb-4 rounded-2xl border border-border bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Selected student
      </p>
      <p className="mt-2 text-base font-semibold text-text">
        {selectedName || 'No student selected'}
      </p>
      <p className="text-sm text-slate-500">
        {selectedStudent?.email || ''}
      </p>
    </div>

    <EnrollmentForm
      control={control}
      register={register}
      errors={errors}
      students={students}
      courses={courses}
      onSubmit={onSubmit}
      submitLabel={isSubmitting ? 'Saving...' : 'Create Enrollment'}
      hideStudent
    />
  </div>
</Modal>

      {enrollments.length ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-text">Recent enrollments</h2>
              <p className="text-sm text-slate-500">Latest program activity across the institute.</p>
            </div>
            <Badge variant="default">{enrollments.length} records</Badge>
          </div>

          <div className="space-y-3">
            {enrollments.slice(0, 5).map((enrollment) => (
              <div key={enrollment.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{enrollment.student_name}</p>
                    <p className="text-sm text-slate-500">{enrollment.course_name}</p>
                  </div>
                  <Badge variant={enrollment.enrollment_status === 'active' ? 'success' : 'warning'} className="capitalize">
                    {enrollment.enrollment_status}
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {formatDate(enrollment.program_start_date)} - {formatDate(enrollment.program_end_date)}
                </p>

                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Schedules: {formatScheduleSummary(enrollment.schedules || [])}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
