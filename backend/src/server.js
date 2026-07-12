import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { startDatabaseBootstrap } from './config/db.js';
import { initSocket } from './config/socket.js';
import { startAttendanceCron } from './cron/attendanceCron.js';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);
const server = http.createServer(app);

const bootstrap = async () => {
  initSocket(server);
  startAttendanceCron();
  startDatabaseBootstrap();

  server.listen(PORT, () => {
    console.log(`New Horizons Attendance backend is running on port ${PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
