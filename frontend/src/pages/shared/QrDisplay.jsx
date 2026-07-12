import { useEffect, useState } from 'react';
import { QrDisplayPanel } from '../../components/attendance/QrDisplayPanel';
import { qrService } from '../../services/qrService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const REFRESH_SECONDS = 30;

export default function QrDisplay() {
  const [session, setSession] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_SECONDS);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    setLoading(true);
    try {
      const response = await qrService.createSession();
      setSession(response?.data || response);
      setCountdown(REFRESH_SECONDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          refreshSession();
          return REFRESH_SECONDS;
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center px-4 py-8">
      <div className="w-full space-y-6">
        <Card className="p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange">Display mode</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-text">QR Check-In Display</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            This screen refreshes the attendance session automatically every 30 seconds.
          </p>
        </Card>
        {loading && !session ? (
          <Card className="p-10 text-center text-sm text-slate-500">Generating session...</Card>
        ) : (
          <QrDisplayPanel session={session} countdown={countdown} />
        )}
        <div className="flex justify-center">
          <Button variant="secondary" onClick={refreshSession}>Refresh Now</Button>
        </div>
      </div>
    </div>
  );
}
