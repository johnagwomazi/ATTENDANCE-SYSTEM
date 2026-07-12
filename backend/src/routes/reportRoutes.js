import { Router } from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { monthly, today, weekly } from '../controllers/reportController.js';

const router = Router();

router.use(protect, authorize('admin', 'manager'));

router.get('/today', today);
router.get('/weekly', weekly);
router.get('/monthly', monthly);

export default router;
