import { asyncHandler } from '../utils/asyncHandler.js';
import { createDynamicAttendanceSession } from '../services/attendanceSessionService.js';

export const createSession = asyncHandler(async (_req, res) => {
  const session = await createDynamicAttendanceSession();
  return res.status(201).json({
    success: true,
    message: 'Attendance session created successfully.',
    data: session
  });
});
