import { Router } from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { create, list, read, remove, update } from '../controllers/courseController.js';
import { createCourseValidation, updateCourseValidation } from '../validations/courseValidation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { idParamValidation } from '../validations/commonValidation.js';

const router = Router();

router.use(protect, authorize('admin'));

router.post('/', createCourseValidation, validateRequest, create);
router.get('/', list);
router.get('/:id', idParamValidation, validateRequest, read);
router.put('/:id', idParamValidation, updateCourseValidation, validateRequest, update);
router.delete('/:id', idParamValidation, validateRequest, remove);

export default router;
