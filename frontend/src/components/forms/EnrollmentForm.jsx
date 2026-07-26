import { Controller } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { getSessionOptions } from '../../utils/courseSchedule';

export const EnrollmentForm = ({
  control,
  errors,
  register,
  students = [],
  courses = [],
  onSubmit,
  secondaryActionLabel = null,
  onSecondaryAction = null,
  submitLabel = 'Save Enrollment',
  hideStudent = false
}) => {
  const sessionOptions = getSessionOptions();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {hideStudent ? (
          <input type="hidden" {...register('studentId')} />
        ) : (
          <Controller
            name="studentId"
            control={control}
            render={({ field }) => (
              <Select {...field} label="Student" error={errors?.studentId?.message}>
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName || student.full_name || student.name}
                    {student.email ? ` (${student.email})` : ''}
                  </option>
                ))}
              </Select>
            )}
          />
        )}

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
      </div>

      <Controller
        name="session"
        control={control}
        render={({ field }) => (
          <Select {...field} label="Session" error={errors?.session?.message}>
            {sessionOptions.map((session) => (
              <option key={session.key} value={session.key}>
                {session.label} ({session.timeLabel})
              </option>
            ))}
          </Select>
        )}
      />

      <div className="flex flex-wrap justify-end gap-3">
        {secondaryActionLabel && onSecondaryAction ? (
          <Button type="button" variant="secondary" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        ) : null}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};
