import { Router } from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { myAttendanceHistory, myAttendanceSummary, myDashboard, myEnrollments, mySchedules } from '../controllers/studentController.js';

const router = Router();

router.use(protect, authorize('student'));

router.get('/me/dashboard', myDashboard);
router.get('/me/enrollments', myEnrollments);
router.get('/me/schedules', mySchedules);
router.get('/me/attendance-summary', myAttendanceSummary);
router.get('/me/attendance', myAttendanceHistory);

export default router;
