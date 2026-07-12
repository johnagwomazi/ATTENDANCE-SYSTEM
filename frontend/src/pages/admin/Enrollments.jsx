import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatDate } from '../../utils/format';

const defaultValues = {
  studentId: '',
  courseId: '',
  programStartDate: '',
  programEndDate: ''
};

export default function Enrollments() {
  const {
    unenrolledStudents,
    courses,
    fetchUnenrolledStudents,
    fetchCourses,
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
    fetchUnenrolledStudents();
    fetchCourses();
  }, [fetchUnenrolledStudents, fetchCourses]);

  const openEnrollModal = (student) => {
    setSelectedStudent(student);
    reset({
      ...defaultValues,
      studentId: student.id
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
      await createEnrollment(values);
      toast.success('Student enrolled successfully.');
      closeModal();
      await fetchUnenrolledStudents();
    } catch (error) {
      toast.error(error.message || 'Unable to enroll student.');
    }
  });

  const selectedName = useMemo(() => selectedStudent?.full_name || selectedStudent?.fullName || '', [selectedStudent]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Enrollment management</p>
            <h1 className="mt-3 text-3xl font-black text-text">Enroll students</h1>
            <p className="mt-2 text-sm text-slate-500">Select a student from the unenrolled pool and assign a program.</p>
          </div>
        </div>
      </Card>

      <Table
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'action', label: 'Action' }
        ]}
        rows={unenrolledStudents}
        emptyMessage="No unenrolled students are available."
        renderRow={(row) => (
          <>
            <td className="px-5 py-4 font-semibold text-text">{row.full_name || row.fullName}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{row.email}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{row.phone}</td>
            <td className="px-5 py-4">
              <Button variant="orange" onClick={() => openEnrollModal(row)}>
                Enroll
              </Button>
            </td>
          </>
        )}
      />

      <Modal
        open={open}
        title={selectedStudent ? `Enroll ${selectedName}` : 'Enroll student'}
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="enrollment-form" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create Enrollment'}
            </Button>
          </>
        }
      >
        <form id="enrollment-form" className="grid gap-5" onSubmit={onSubmit}>
          <input type="hidden" {...register('studentId')} />

          <Controller
            name="courseId"
            control={control}
            render={({ field }) => (
              <Select {...field} label="Course" error={errors?.courseId?.message}>
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
            )}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Controller
              name="programStartDate"
              control={control}
              render={({ field }) => (
                <Input {...field} type="date" label="Program Start Date" error={errors?.programStartDate?.message} />
              )}
            />

            <Controller
              name="programEndDate"
              control={control}
              render={({ field }) => (
                <Input {...field} type="date" label="Program End Date" error={errors?.programEndDate?.message} />
              )}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
