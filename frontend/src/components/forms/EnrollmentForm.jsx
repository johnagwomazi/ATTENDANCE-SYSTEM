import { Controller, useFieldArray } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const EnrollmentForm = ({
  control,
  errors,
  register,
  students = [],
  courses = [],
  onSubmit,
  submitLabel = 'Save Enrollment',
  hideStudent = false
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'courseSchedules'
  });

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

        <Controller
          name="programStartDate"
          control={control}
          render={({ field }) => <Input {...field} type="date" label="Program Start Date" error={errors?.programStartDate?.message} />}
        />

        <Controller
          name="programEndDate"
          control={control}
          render={({ field }) => <Input {...field} type="date" label="Program End Date" error={errors?.programEndDate?.message} />}
        />
      </div>

      <div className="space-y-4 rounded-[28px] border border-border bg-slate-50/70 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500">Course Schedule</h4>
            <p className="mt-1 text-sm text-slate-500">Add every class day for this course.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ dayOfWeek: '', startTime: '', endTime: '' })}
          >
            Add Day
          </Button>
        </div>

        <div className="space-y-3">
          {fields.length ? fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
              <div className="grid gap-4 md:grid-cols-[1.3fr_1fr_1fr_auto]">
                <Controller
                  name={`courseSchedules.${index}.dayOfWeek`}
                  control={control}
                  render={({ field: dayField }) => (
                    <Select {...dayField} label="Day" error={errors?.courseSchedules?.[index]?.dayOfWeek?.message}>
                      <option value="">Select day</option>
                      {dayOptions.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name={`courseSchedules.${index}.startTime`}
                  control={control}
                  render={({ field: timeField }) => (
                    <Input {...timeField} type="time" label="Start Time" error={errors?.courseSchedules?.[index]?.startTime?.message} />
                  )}
                />

                <Controller
                  name={`courseSchedules.${index}.endTime`}
                  control={control}
                  render={({ field: timeField }) => (
                    <Input {...timeField} type="time" label="End Time" error={errors?.courseSchedules?.[index]?.endTime?.message} />
                  )}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full md:w-auto"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-border bg-white px-4 py-5 text-sm text-slate-500">
              No schedule rows yet. Click Add Day to define the class timetable.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
