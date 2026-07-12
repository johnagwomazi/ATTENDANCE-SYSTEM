import { Controller } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const EnrollmentForm = ({ control, errors, students = [], courses = [], onSubmit, submitLabel = 'Save Enrollment' }) => {
  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
      <Controller
        name="studentId"
        control={control}
        render={({ field }) => (
          <Select {...field} label="Student" error={errors?.studentId?.message}>
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} {student.email ? `(${student.email})` : ''}
              </option>
            ))}
          </Select>
        )}
      />
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
      <Controller
        name="programStartDate"
        control={control}
        render={({ field }) => <Input {...field} type="date" label="Start Date" error={errors?.programStartDate?.message} />}
      />
      <Controller
        name="programEndDate"
        control={control}
        render={({ field }) => <Input {...field} type="date" label="End Date" error={errors?.programEndDate?.message} />}
      />
      <Controller
        name="enrollmentStatus"
        control={control}
        render={({ field }) => (
          <Select {...field} label="Status" error={errors?.enrollmentStatus?.message}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </Select>
        )}
      />
      <div className="flex items-end">
        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
