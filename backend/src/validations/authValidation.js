import { body } from 'express-validator';

export const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ min: 3 }).withMessage('Full name must be at least 3 characters long.'),
  body('email').trim().isEmail().withMessage('A valid email address is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.').isLength({ min: 7 }).withMessage('Phone number is too short.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('A valid email address is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];
