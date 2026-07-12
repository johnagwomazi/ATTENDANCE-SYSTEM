import { Card } from '../ui/Card';
import { CountdownTimer } from './CountdownTimer';

export const QrDisplayPanel = ({ session, countdown }) => {
  return (
    <Card className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-10 text-center md:px-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange">New Horizons</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-text">Student Check-In</h2>
      </div>
      <div className="rounded-[32px] border border-border bg-white p-5 shadow-soft">
        {session?.qrCodeDataUrl ? (
          <img src={session.qrCodeDataUrl} alt="Attendance QR Code" className="h-72 w-72 rounded-[24px]" />
        ) : (
          <div className="flex h-72 w-72 items-center justify-center rounded-[24px] bg-slate-100 text-slate-400">
            Generating QR code...
          </div>
        )}
      </div>
      <p className="max-w-lg text-sm leading-7 text-slate-500">
        Students scan this code to open the attendance flow. The session refreshes automatically every 30 seconds.
      </p>
      <CountdownTimer seconds={countdown} />
    </Card>
  );
};
