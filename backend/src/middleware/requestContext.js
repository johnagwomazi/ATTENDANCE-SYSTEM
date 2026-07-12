import { getCurrentDate, getCurrentTime, getCurrentWeekday } from '../utils/date.js';

export const requestContext = (req, _res, next) => {
  req.appContext = {
    date: getCurrentDate(),
    time: getCurrentTime(),
    weekday: getCurrentWeekday()
  };

  next();
};
