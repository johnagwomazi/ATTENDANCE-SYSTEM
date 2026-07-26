import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { createId } from '../utils/uuid.js';
import { createAttendanceSession, findAttendanceSessionByToken } from '../models/attendanceSessionModel.js';

const SESSION_MINUTES = 10;
const SESSION_CODE_LENGTH = 8;
const SESSION_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const createSessionCode = (length = SESSION_CODE_LENGTH) => {
  const bytes = randomBytes(length);
  let code = '';

  for (let index = 0; index < length; index += 1) {
    code += SESSION_CODE_CHARS[bytes[index] % SESSION_CODE_CHARS.length];
  }

  return code;
};

export const createDynamicAttendanceSession = async () => {
  const token = createSessionCode();
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
