import { verifyJwt } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return req.cookies?.auth_token || null;
};

export const protect = (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new ApiError(401, 'Unauthorized');
    }

    const decoded = verifyJwt(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(401, 'Unauthorized'));
  }
};

export const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden'));
    }

    return next();
  };
};
