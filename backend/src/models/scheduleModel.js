import { query } from '../config/db.js';

export const createSchedule = async ({ id, courseId, dayOfWeek, startTime, endTime }) => {
  await query(
    'INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
    [id, courseId, dayOfWeek, startTime, endTime]
  );
  return findScheduleById(id);
};

export const findScheduleById = async (id) => {
  const [rows] = await query('SELECT * FROM schedules WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const findSchedulesByCourseId = async (courseId) => {
  const [rows] = await query('SELECT * FROM schedules WHERE course_id = ? ORDER BY day_of_week, start_time', [courseId]);
  return rows;
};

export const listSchedules = async () => {
  const [rows] = await query(
    `SELECT s.*, c.name AS course_name
     FROM schedules s
     JOIN courses c ON c.id = s.course_id
     ORDER BY s.day_of_week, s.start_time`
  );
  return rows;
};

export const deleteScheduleById = async (id) => {
  const [result] = await query('DELETE FROM schedules WHERE id = ?', [id]);
  return result.affectedRows > 0;
};
