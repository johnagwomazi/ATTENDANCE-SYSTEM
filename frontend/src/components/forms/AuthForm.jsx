import { Controller } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const AuthForm = ({ control, errors, fields, submitLabel, onSubmit, secondaryAction }) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-[28px] border border-border bg-surface p-6 shadow-soft md:p-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">New Horizons</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text">{submitLabel}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">Use your institute credentials to continue.</p>
      </div>

      <div className="space-y-5">
        {fields.map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <Input
                {...controllerField}
                type={field.type}
                label={field.label}
                placeholder={field.placeholder}
                error={errors?.[field.name]?.message}
              />
            )}
          />
        ))}
      </div>

      <div className="mt-7 space-y-4">
        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  );
};
