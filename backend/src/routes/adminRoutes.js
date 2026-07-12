import { Router } from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createEnrollmentValidation } from '../validations/enrollmentValidation.js';
import { createEnrollment, listEnrolledStudents, listUnenrolledStudents } from '../controllers/adminEnrollmentController.js';
import { getStudentAttendance, listAllStudents } from '../controllers/adminStudentController.js';
import { idParamValidation } from '../validations/commonValidation.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/students', listAllStudents);
router.get('/students/unenrolled', listUnenrolledStudents);
router.get('/students/enrolled', listEnrolledStudents);
router.get('/students/:id/attendance', idParamValidation, validateRequest, getStudentAttendance);
router.post('/enrollments', createEnrollmentValidation, validateRequest, createEnrollment);

export default router;
