import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';

export default function App() {
  const { isAuthenticated, loading, role, fetchCurrentUser } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      connect();
    } else if (!loading && !isAuthenticated) {
      disconnect();
    }
  }, [isAuthenticated, loading, role, connect, disconnect]);

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '20px',
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e5e7eb',
            boxShadow: '0 16px 45px rgba(15, 23, 42, 0.10)'
          }
        }}
      />
    </>
  );
}
