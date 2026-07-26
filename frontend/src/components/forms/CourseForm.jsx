import { Controller, useWatch } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { getClassDayOptions, getSessionOptions } from '../../utils/courseSchedule';

export const CourseForm = ({ control, errors, onSubmit, submitLabel = 'Save Course' }) => {
  const classDayOptions = getClassDayOptions();
  const sessionOptions = getSessionOptions();
  const [classDayOne, classDayTwo] = useWatch({
    control,
    name: ['classDayOne', 'classDayTwo']
  }) || [];

  const selectedDays = [classDayOne, classDayTwo].filter(Boolean);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Controller
        name="name"
        control={control}
        render={({ field }) => <Input {...field} label="Course Name" error={errors?.name?.message} />}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => <Textarea {...field} label="Description" error={errors?.description?.message} />}
      />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-text">Class Days</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="classDayOne"
            control={control}
            render={({ field }) => (
              <Select {...field} label="Day 1" error={errors?.classDayOne?.message}>
                <option value="">Select a day</option>
                {classDayOptions.map((option) => (
                  <option key={option.key} value={option.key} disabled={option.key === classDayTwo}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
          <Controller
            name="classDayTwo"
            control={control}
            render={({ field }) => (
              <Select {...field} label="Day 2" error={errors?.classDayTwo?.message}>
                <option value="">Select a day</option>
                {classDayOptions.map((option) => (
                  <option key={option.key} value={option.key} disabled={option.key === classDayOne}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </div>
        {errors?.classDays?.message ? <p className="text-sm text-red-600">{errors.classDays.message}</p> : null}
        <p className="text-xs text-slate-400">
          Selected: {selectedDays.length ? selectedDays.join(' & ') : 'No days selected yet'}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-text">Available Sessions</p>
        <div className="grid gap-3 md:grid-cols-2">
          {sessionOptions.map((session) => (
            <div key={session.key} className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="font-bold text-text">{session.label}</p>
              <p className="mt-1 text-sm text-slate-500">{session.timeLabel}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => <Input {...field} type="date" label="Start Date" error={errors?.startDate?.message} />}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => <Input {...field} type="date" label="End Date" error={errors?.endDate?.message} />}
        />
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
};
