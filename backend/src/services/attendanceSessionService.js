import QRCode from 'qrcode';
import { createId } from '../utils/uuid.js';
import { createAttendanceSession, findAttendanceSessionByToken } from '../models/attendanceSessionModel.js';

const SESSION_MINUTES = 10;

export const createDynamicAttendanceSession = async () => {
  const token = createId();
  const expiresAt = new Date(Date.now() + SESSION_MINUTES * 60 * 1000);
  const clientUrl = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')[0].trim()
    : 'http://localhost:3000';
  const attendanceUrl = `${clientUrl}/checkin?token=${token}`;
  const qrCodeDataUrl = await QRCode.toDataURL(attendanceUrl, {
    margin: 1,
    width: 240,
    errorCorrectionLevel: 'M'
  });

  await createAttendanceSession({
    id: createId(),
    token,
    expiresAt
  });

  return {
    token,
    expiresAt: expiresAt.toISOString(),
    attendanceUrl,
    qrCodeDataUrl
  };
};

export const validateAttendanceSessionToken = async (token) => {
  const session = await findAttendanceSessionByToken(token);
  if (!session) {
    return null;
  }

  const expirationTime = new Date(session.expires_at).getTime();
  if (Number.isNaN(expirationTime) || expirationTime < Date.now()) {
    return null;
  }

  return session;
};
