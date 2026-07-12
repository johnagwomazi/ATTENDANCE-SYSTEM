import { body } from 'express-validator';

export const createCourseValidation = [
  body('name').trim().notEmpty().withMessage('Course name is required.'),
  body('description').optional().trim().isString()
];

export const updateCourseValidation = [
  body('name').optional().trim().notEmpty().withMessage('Course name cannot be empty.'),
  body('description').optional().trim().isString()
];
