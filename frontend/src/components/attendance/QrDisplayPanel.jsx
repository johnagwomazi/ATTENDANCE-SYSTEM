import { Card } from '../ui/Card';
import { CountdownTimer } from './CountdownTimer';

export const QrDisplayPanel = ({ session, countdown }) => {
  return (
    <Card className="mx-auto flex h-[75vh] w-full max-w-2xl flex-col items-center gap-4 overflow-hidden px-4 py-5 text-center sm:px-5 md:px-6 md:py-6">
      <div className="shrink-0">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange">New Horizons</p>
        <h2 className="mt-2 text-lg font-black tracking-tight text-text sm:text-xl md:text-2xl">Student Check-In</h2>
      </div>
      <div className="flex flex-1 min-h-0 items-center justify-center rounded-[28px] border border-border bg-white p-3 shadow-soft md:p-4">
        {session?.qrCodeDataUrl ? (
          <img
            src={session.qrCodeDataUrl}
            alt="Attendance QR Code"
            className="aspect-square h-full max-h-[35vh] w-full max-w-[35vh] rounded-[20px] object-contain sm:max-h-[38vh] sm:max-w-[38vh]"
          />
        ) : (
          <div className="flex aspect-square h-full max-h-[35vh] w-full max-w-[35vh] items-center justify-center rounded-[20px] bg-slate-100 text-sm text-slate-400 sm:max-h-[38vh] sm:max-w-[38vh]">
            Generating QR code...
          </div>
        )}
      </div>
      <div className="w-full max-w-lg shrink-0 rounded-[24px] border border-border bg-slate-50 px-4 py-3 md:px-5 md:py-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Session Code</p>
        <p className="mt-2 text-base font-black tracking-[0.24em] text-text sm:text-lg md:text-2xl">
          {session?.token || '--------'}
        </p>
      </div>
      <div className="shrink-0 pb-1">
        <CountdownTimer seconds={countdown} />
      </div>
    </Card>
  );
};
