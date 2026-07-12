import { asyncHandler } from '../utils/asyncHandler.js';
import { checkInStudent } from '../services/attendanceService.js';

export const checkIn = asyncHandler(async (req, res) => {
  const result = await checkInStudent({
    student: req.user,
    token: req.body.token
  });

  return res.status(200).json({
    success: true,
    message: result.message,
    data: {
      attendance: result.attendance,
      event: result.meta
    }
  });
});
