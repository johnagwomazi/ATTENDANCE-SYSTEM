import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AuthForm } from '../../components/forms/AuthForm';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(7, 'Phone number is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.')
});

export default function Register() {
  const { register: registerAction, isAuthenticated, role, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', password: '' }
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (role === 'manager') navigate('/manager/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, role]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerAction(values);
      toast.success('Registration successful.');
      const from = location.state?.from;
      if (from?.pathname) {
        navigate(`${from.pathname}${from.search || ''}`, { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(error.message);
    }
  });

  return (
    <AuthForm
      control={control}
      errors={errors}
      fields={[
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'john@school.com' },
        { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+234...' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' }
      ]}
      submitLabel={isSubmitting ? 'Creating...' : 'Create Account'}
      onSubmit={onSubmit}
      secondaryAction={(
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      )}
    />
  );
}
