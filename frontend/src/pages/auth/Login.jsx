import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AuthForm } from '../../components/forms/AuthForm';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role, loading } = useAuthStore();
  const fields = useMemo(() => [
    { name: 'email', label: 'Email', type: 'email', placeholder: 'john@school.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' }
  ], []);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (role === 'manager') navigate('/manager/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, role]);

  const redirectAfterLogin = () => {
    const from = location.state?.from;
    if (from?.pathname) {
      return `${from.pathname}${from.search || ''}`;
    }
    const role = useAuthStore.getState().role;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'manager') return '/manager/dashboard';
    return '/student/dashboard';
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      toast.success('Login successful.');
      navigate(redirectAfterLogin(), { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  });

  return (
    <AuthForm
      control={control}
      errors={errors}
      fields={fields}
      submitLabel={isSubmitting ? 'Signing in...' : 'Login'}
      onSubmit={onSubmit}
      secondaryAction={(
        <p className="text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create Account
          </Link>
        </p>
      )}
    />
  );
}
