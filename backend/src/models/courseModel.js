import { query } from '../config/db.js';

export const createCourse = async ({ id, name, description }) => {
  await query('INSERT INTO courses (id, name, description) VALUES (?, ?, ?)', [id, name, description]);
  return findCourseById(id);
};

export const findCourseById = async (id) => {
  const [rows] = await query('SELECT * FROM courses WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const listCourses = async () => {
  const [rows] = await query('SELECT * FROM courses ORDER BY created_at DESC');
  return rows;
};

export const deleteCourseById = async (id) => {
  const [result] = await query('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
};
