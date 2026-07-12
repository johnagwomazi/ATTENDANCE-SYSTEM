import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/apiError.js';
import { signJwt } from '../utils/jwt.js';
import { createId } from '../utils/uuid.js';
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js';

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const registerStudent = async ({ fullName, email, phone, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const createdUser = await createUser({
    id: createId(),
    fullName,
    email,
    phone,
    password: hashedPassword,
    role: 'student',
    isActive: 1
  });

  const token = signJwt({
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
    fullName: createdUser.full_name
  });

  return {
    user: sanitizeUser(createdUser),
    token
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'This account is inactive.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const token = signJwt({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name
  });

  return {
    user: sanitizeUser(user),
    token
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return sanitizeUser(user);
};
