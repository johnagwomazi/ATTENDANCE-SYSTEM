import { query } from '../config/db.js';

export const createAttendanceSession = async ({ id, token, expiresAt }) => {
  await query(
    'INSERT INTO attendance_sessions (id, token, expires_at) VALUES (?, ?, ?)',
    [id, token, expiresAt]
  );
  return findAttendanceSessionByToken(token);
};

export const findAttendanceSessionByToken = async (token) => {
  const [rows] = await query(
    'SELECT * FROM attendance_sessions WHERE token = ? LIMIT 1',
    [token]
  );
  return rows[0] || null;
};
