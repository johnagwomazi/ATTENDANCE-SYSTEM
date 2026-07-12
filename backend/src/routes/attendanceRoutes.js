import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkIn } from '../controllers/attendanceController.js';
import { checkInValidation } from '../validations/attendanceValidation.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/checkin', protect, checkInValidation, validateRequest, checkIn);

export default router;
