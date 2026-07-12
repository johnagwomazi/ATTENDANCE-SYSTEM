import { query } from '../config/db.js';

export const createEntryAttempt = async ({ id, studentId = null, courseId = null, attemptTime, attemptType }) => {
  await query(
    'INSERT INTO entry_attempts (id, student_id, course_id, attempt_time, attempt_type) VALUES (?, ?, ?, ?, ?)',
    [id, studentId, courseId, attemptTime, attemptType]
  );
};
