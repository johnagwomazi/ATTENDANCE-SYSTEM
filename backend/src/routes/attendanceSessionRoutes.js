import { Router } from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { createSession } from '../controllers/attendanceSessionController.js';

const router = Router();

router.post('/create', protect, authorize('admin', 'manager'), createSession);

export default router;
