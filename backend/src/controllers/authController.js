import { asyncHandler } from '../utils/asyncHandler.js';
import { authCookieOptions } from '../utils/cookie.js';
import { registerStudent, loginUser, getCurrentUser } from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await registerStudent(req.body);
  res.cookie('auth_token', token, authCookieOptions());
  return res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: { user }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);
  res.cookie('auth_token', token, authCookieOptions());
  return res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: { user }
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('auth_token', authCookieOptions());
  return res.status(200).json({
    success: true,
    message: 'Logout successful.'
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  return res.status(200).json({
    success: true,
    message: 'Current user retrieved successfully.',
    data: { user }
  });
});
