import { query } from '../config/db.js';
import { getClassDaysLabel, normalizeClassDays } from '../utils/courseSchedule.js';

const mapCourseRow = (row) => {
  if (!row) return null;

  const classDays = normalizeClassDays(row.class_days);
  return {
    ...row,
    class_days: row.class_days,
    classDays,
    classDaysLabel: getClassDaysLabel(classDays),
    startDate: row.start_date || null,
    endDate: row.end_date || null
  };
};

export const createCourse = async ({ id, name, description, classDays = [], startDate = null, endDate = null }) => {
  await query(
    'INSERT INTO courses (id, name, description, class_days, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, description, JSON.stringify(classDays || []), startDate, endDate]
  );
  return findCourseById(id);
};

export const findCourseById = async (id) => {
  const [rows] = await query('SELECT * FROM courses WHERE id = ? LIMIT 1', [id]);
  return mapCourseRow(rows[0] || null);
};

export const listCourses = async () => {
  const [rows] = await query('SELECT * FROM courses ORDER BY created_at DESC');
  return rows.map(mapCourseRow);
};

export const deleteCourseById = async (id) => {
  const [result] = await query('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
};
