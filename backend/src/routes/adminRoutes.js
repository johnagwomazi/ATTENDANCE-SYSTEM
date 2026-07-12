import { Router } from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createEnrollmentValidation } from '../validations/enrollmentValidation.js';
import {
  createEnrollment,
  listEnrolledStudents,
  listUnenrolledStudents
} from '../controllers/adminEnrollmentController.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/students/unenrolled', listUnenrolledStudents);
router.get('/students/enrolled', listEnrolledStudents);
router.post('/enrollments', createEnrollmentValidation, validateRequest, createEnrollment);

export default router;
