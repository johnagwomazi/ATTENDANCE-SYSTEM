import { isDatabaseReady } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';

export const databaseReady = (req, _res, next) => {
  if (!req.path.startsWith('/api')) {
    return next();
  }

  if (!isDatabaseReady()) {
    return next(new ApiError(503, 'The database is not ready yet. Please try again in a moment.'));
  }

  return next();
};
