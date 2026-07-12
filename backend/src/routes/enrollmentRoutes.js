import { Router } from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { create, endProgramController, list, read, update } from '../controllers/enrollmentController.js';
import { createEnrollmentValidation, updateEnrollmentValidation } from '../validations/enrollmentValidation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { idParamValidation } from '../validations/commonValidation.js';

const router = Router();

router.use(protect, authorize('admin'));

router.post('/', createEnrollmentValidation, validateRequest, create);
router.get('/', list);
router.get('/:id', idParamValidation, validateRequest, read);
router.put('/:id', idParamValidation, updateEnrollmentValidation, validateRequest, update);
router.patch('/:id/end-program', idParamValidation, validateRequest, endProgramController);

export default router;
