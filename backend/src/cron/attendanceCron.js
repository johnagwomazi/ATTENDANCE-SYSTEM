import cron from 'node-cron';
import { runDailyAbsentJob } from '../services/cronService.js';

export const startAttendanceCron = () => {
  cron.schedule(
    '0 6 * * *',
    async () => {
      try {
        await runDailyAbsentJob();
      } catch (error) {
        console.error('Attendance cron failed:', error);
      }
    },
    {
      timezone: process.env.APP_TIME_ZONE || 'Africa/Lagos'
    }
  );
};
