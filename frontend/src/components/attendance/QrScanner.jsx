import { useEffect, useRef } from 'react';

export const QrScanner = ({ onScan, onError, active = true }) => {
  const ref = useRef(null);

  useEffect(() => {
    let scanner;
    let cancelled = false;

    const start = async () => {
      if (!active || !ref.current) return;
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      if (cancelled) return;
      scanner = new Html5QrcodeScanner(
        ref.current.id,
        { fps: 10, qrbox: 250, rememberLastUsedCamera: true },
        false
      );
      scanner.render(
        (decodedText) => onScan(decodedText),
        (errorMessage) => onError?.(errorMessage)
      );
    };

    start();

    return () => {
      cancelled = true;
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [active, onError, onScan]);

  return <div ref={ref} id="html5-qr-scanner" className="overflow-hidden rounded-[24px]" />;
};
