import { Router } from 'express';
import { login, logout, me, register } from '../controllers/authController.js';
import { loginValidation, registerValidation } from '../validations/authValidation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
