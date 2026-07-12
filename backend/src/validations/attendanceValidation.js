import { body } from 'express-validator';

export const checkInValidation = [
  body('token').isUUID().withMessage('A valid QR token is required.')
];
