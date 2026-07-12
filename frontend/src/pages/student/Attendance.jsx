import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AttendanceResult } from '../../components/attendance/AttendanceResult';
import { QrScanner } from '../../components/attendance/QrScanner';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { motion } from 'framer-motion';

const schema = z.object({
  token: z.string().min(8, 'A valid QR token is required.')
});

export default function Attendance({ publicMode = false }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuthStore();
  const checkIn = useAttendanceStore((state) => state.checkIn);
  const [result, setResult] = useState(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);

  const tokenFromUrl = searchParams.get('token') || '';
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { token: tokenFromUrl }
  });

  useEffect(() => {
    if (!loading && !isAuthenticated && !publicMode) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, loading, location, navigate, publicMode]);

  useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const submitCheckIn = async (values) => {
    try {
      const { response, record } = await checkIn(values.token);
      const message = response?.message || 'Attendance recorded successfully.';
      setResult({
        type: 'success',
        message,
        record
      });
      toast.success(message);
      } catch (error) {
        const message = error.message || 'Attendance could not be completed.';
        if (/program has ended/i.test(message)) {
          setResult({ type: 'expired_program', message });
        } else if (/scheduled class today/i.test(message)) {
          setResult({ type: 'invalid_schedule', message: 'You do not have a class today.' });
        } else {
          setResult({ type: 'blocked', message });
        }
        toast.error(message);
      }
  };

  const onSubmit = handleSubmit(submitCheckIn);

  if (!publicMode && loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="primary">QR Check-In</Badge>
        <Badge variant="default">Secure Session</Badge>
      </div>

      <Card className="p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Student attendance</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-text">Check in with your QR token</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Scan the QR code, confirm the token, and submit your attendance in one smooth flow.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setScannerEnabled((value) => !value)}>
            {scannerEnabled ? 'Hide Scanner' : 'Show Scanner'}
          </Button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <form onSubmit={onSubmit} className="space-y-4">
              <Controller
                name="token"
                control={control}
                render={({ field }) => <Input {...field} label="QR Token" placeholder="Paste or scan the token" error={errors?.token?.message} />}
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                </Button>
                {publicMode ? null : (
                  <Button type="button" variant="secondary" onClick={() => navigate('/student/dashboard')}>
                    Back to Dashboard
                  </Button>
                )}
              </div>
            </form>

            {scannerEnabled ? (
              <div className="overflow-hidden rounded-[28px] border border-border bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-text">Camera Scanner</p>
                <QrScanner
                  onScan={(decodedText) => {
                    setValue('token', decodedText, { shouldValidate: true });
                    toast.success('QR token detected.');
                  }}
                  onError={() => {}}
                />
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-center">
            {result ? (
              <AttendanceResult result={result} />
            ) : (
              <motion.div
                className="rounded-[28px] border border-dashed border-border bg-slate-50 px-6 py-14 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-lg font-bold text-text">Ready when you are</p>
                <p className="mt-2 text-sm text-slate-500">Your attendance result will appear here after submission.</p>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
