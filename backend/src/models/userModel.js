import { query } from '../config/db.js';

export const createUser = async ({ id, fullName, email, phone, password, role = 'student', isActive = 1 }) => {
  await query(
    'INSERT INTO users (id, full_name, email, phone, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, fullName, email, phone, password, role, isActive]
  );
  return findUserById(id);
};

export const findUserByEmail = async (email) => {
  const [rows] = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const [rows] = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const listUsers = async () => {
  const [rows] = await query('SELECT * FROM users ORDER BY created_at DESC');
  return rows;
};
