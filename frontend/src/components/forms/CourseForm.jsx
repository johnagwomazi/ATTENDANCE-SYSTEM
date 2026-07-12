import { Controller } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

export const CourseForm = ({ control, errors, onSubmit, submitLabel = 'Save Course' }) => {
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
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
};
