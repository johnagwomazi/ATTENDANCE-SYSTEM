import { body } from 'express-validator';

export const checkInValidation = [
  body('token')
    .isLength({ min: 8, max: 8 })
    .matches(/^[A-Z0-9]{8}$/)
    .withMessage('A valid 8-character QR code is required.')
];
