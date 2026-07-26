import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle2, Clock3, RefreshCw, Users } from 'lucide-react';
import { useSocketStore } from '../../store/socketStore';
import { LiveFeed } from '../../components/attendance/LiveFeed';
import { Card } from '../../components/ui/Card';
import { useAdminStore } from '../../store/adminStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { QrDisplayPanel } from '../../components/attendance/QrDisplayPanel';
import { qrService } from '../../services/qrService';
import { formatClock } from '../../utils/format';
import { StatCard } from '../../components/shared/StatCard';

const REFRESH_SECONDS = 30;

const getAlertMeta = (item) => {
  const type = String(item?.attemptType || item?.type || item?.status || '').toLowerCase();

  if (type.includes('duplicate') || type.includes('already')) {
    return {
      label: 'Already scanned',
      tone: 'warning',
      Icon: CheckCircle2
    };
  }

  if (type.includes('invalid') || type.includes('wrong')) {
    return {
      label: 'Wrong class day',
      tone: 'danger',
      Icon: AlertTriangle
    };
  }

  return {
    label: 'Program ended',
    tone: 'slate',
    Icon: AlertTriangle
  };
};

export default function LiveAttendance() {
  const { liveAttendance, expiredAttempts } = useSocketStore();
  const { fetchReports, reports } = useAdminStore();
  const [session, setSession] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_SECONDS);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [clearedAlertCount, setClearedAlertCount] = useState(0);
  const alertsButtonRef = useRef(null);
  const alertsPanelRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const refreshSession = async () => {
    const response = await qrService.createSession();
    setSession(response?.data || response);
    setCountdown(REFRESH_SECONDS);
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

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!alertsOpen) return undefined;

    const handlePointerDown = (event) => {
      if (alertsPanelRef.current?.contains(event.target) || alertsButtonRef.current?.contains(event.target)) {
        return;
      }

      setAlertsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAlertsOpen(false);
        alertsButtonRef.current?.focus?.();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [alertsOpen]);

  useEffect(() => {
    if (alertsOpen) {
      alertsPanelRef.current?.focus?.();
    }
  }, [alertsOpen]);

  const summary = reports.today?.summary || {};
  const presentCount = Number(summary.presentCount || 0);
  const lateCount = Number(summary.lateCount || 0);
  const absentCount = Number(summary.absentCount || 0);
  const expectedCount = Number(summary.totalAttendance || 0) || (presentCount + absentCount);
  const remainingCount = Math.max(expectedCount - presentCount, 0);

  const activeCourses = useMemo(() => {
    const uniqueCourses = [...new Set(liveAttendance.map((item) => item.course).filter(Boolean))];

    if (!uniqueCourses.length) return 'All active courses';
    if (uniqueCourses.length === 1) return uniqueCourses[0];
    return `${uniqueCourses.length} active courses`;
  }, [liveAttendance]);

  const alerts = useMemo(() => {
    const normalized = expiredAttempts.map((item, index) => {
      const meta = getAlertMeta(item);

      return {
        id: `${item.studentName || 'alert'}-${item.course || 'course'}-${item.time || index}-${index}`,
        studentName: item.studentName || 'Unknown student',
        course: item.course || 'Unknown course',
        time: item.time || item.createdAt || item.created_at || '-',
        ...meta
      };
    });

    return normalized.slice(0, Math.max(normalized.length - clearedAlertCount, 0));
  }, [clearedAlertCount, expiredAttempts]);

  const sessionDetails = [
    { label: 'Course', value: activeCourses },
    { label: 'Time', value: session?.expiresAt ? formatClock(session.expiresAt) : '-' },
    { label: 'Expected Students', value: expectedCount || liveAttendance.length || 0 }
  ];

  const alertCount = alerts.length;

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Live Monitoring</p>
            <h1 className="mt-3 text-2xl font-black text-text sm:text-3xl">Attendance feed</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary">Realtime</Badge>
            <div className="relative">
              <button
                ref={alertsButtonRef}
                type="button"
                aria-label={`Open alerts${alertCount ? `, ${alertCount} unread` : ''}`}
                aria-haspopup="dialog"
                aria-expanded={alertsOpen}
                aria-controls="manager-alerts-popover"
                onClick={() => setAlertsOpen((value) => !value)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-slate-600 shadow-soft transition hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <Bell className="h-5 w-5" />
                {alertCount ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {alertCount}
                  </span>
                ) : null}
              </button>

              <AnimatePresence>
                {alertsOpen ? (
                  <motion.div
                    id="manager-alerts-popover"
                    ref={alertsPanelRef}
                    role="dialog"
                    aria-modal="false"
                    tabIndex={-1}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 z-30 mt-3 flex max-h-[calc(100vh-8rem)] w-[22rem] max-w-[calc(100vw-2rem)] flex-col rounded-[24px] border border-border bg-surface p-4 shadow-soft"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Alerts</p>
                        <h2 className="mt-1 text-lg font-extrabold text-text">Notification center</h2>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => setClearedAlertCount(expiredAttempts.length)}
                        className="h-9 rounded-full px-3 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="mt-4 max-h-[18rem] space-y-3 overflow-y-auto pr-1 sm:max-h-[22rem]">
                      {alerts.length ? alerts.map((alert) => {
                        const Icon = alert.Icon;
                        const toneClasses = {
                          warning: 'border-amber-200 bg-amber-50 text-amber-700',
                          danger: 'border-red-200 bg-red-50 text-red-700',
                          slate: 'border-border bg-slate-50 text-slate-600'
                        };

                        return (
                          <div key={alert.id} className="rounded-2xl border border-border bg-white p-4">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClasses[alert.tone]}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-text">{alert.label}</p>
                                <p className="mt-1 text-sm text-slate-500">{alert.studentName}</p>
                                <p className="mt-1 text-xs text-slate-400">{alert.course}</p>
                                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  {formatClock(alert.time)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-500">
                          No alerts at the moment.
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(320px,0.34fr)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,0.33fr)_minmax(0,1fr)]">
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Attendance QR</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-text">Scan Here</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Keep this code visible while students are checking in. It refreshes automatically.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Badge variant="primary">Auto refresh</Badge>
              <Button
                variant="secondary"
                onClick={refreshSession}
                className="h-10 rounded-full px-4 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Now
              </Button>
            </div>
          </Card> */}

          <QrDisplayPanel session={session} countdown={countdown} />

          {/* <Card className="p-5">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {sessionDetails.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-bold text-text">{item.value}</p>
                </div>
              ))}
            </div>
          </Card> */}
        </div>

        <div className="min-w-0 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-2">
          <LiveFeed items={liveAttendance} title="Live attendance" />
        </div>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present" value={presentCount} icon={CheckCircle2} tone="success" index={0} />
        <StatCard label="Late" value={lateCount} icon={Clock3} tone="orange" index={1} />
        <StatCard label="Expected" value={expectedCount} icon={Users} tone="primary" index={2} />
        <StatCard label="Remaining" value={remainingCount} icon={Bell} tone="sky" index={3} />
      </div> */}
    </div>
  );
}
