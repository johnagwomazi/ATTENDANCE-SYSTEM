import { createAbsentRowsForDate } from '../models/attendanceModel.js';
import { isDatabaseReady } from '../config/db.js';
import { getCurrentDate, getCurrentWeekday } from '../utils/date.js';

export const runDailyAbsentJob = async () => {
  if (!isDatabaseReady()) {
    return;
  }

  const attendanceDate = getCurrentDate();
  const weekday = getCurrentWeekday();
  await createAbsentRowsForDate(attendanceDate, weekday);
};
