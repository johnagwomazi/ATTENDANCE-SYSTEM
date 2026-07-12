import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CourseForm } from '../../components/forms/CourseForm';

const schema = z.object({
  name: z.string().min(1, 'Course name is required.'),
  description: z.string().optional()
});

export default function Courses() {
  const { courses, fetchCourses } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' }
  });

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '' });
    setOpen(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    reset({ name: course.name, description: course.description || '' });
    setOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await useAdminStore.getState().updateCourse?.(editing.id, values);
      } else {
        await useAdminStore.getState().createCourse?.(values);
      }
      toast.success(editing ? 'Course updated.' : 'Course created.');
      setOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.message);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Course management</p>
            <h1 className="mt-3 text-3xl font-black text-text">Courses</h1>
          </div>
          <Button onClick={openCreate}>Create Course</Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-text">{course.name}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{course.description || 'No description provided.'}</p>
              </div>
              <Badge variant="primary">Course</Badge>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => openEdit(course)}>Edit</Button>
              <Button variant="orange" onClick={async () => {
                try {
                  await useAdminStore.getState().deleteCourse?.(course.id);
                  toast.success('Course deleted.');
                  fetchCourses();
                } catch (error) {
                  toast.error(error.message);
                }
              }}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        title={editing ? 'Edit course' : 'Create course'}
        onClose={() => setOpen(false)}
      >
        <CourseForm control={control} errors={errors} onSubmit={onSubmit} submitLabel={editing ? 'Update Course' : 'Save Course'} />
      </Modal>
    </div>
  );
}
