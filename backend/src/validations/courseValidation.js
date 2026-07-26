import { body } from 'express-validator';

export const createCourseValidation = [
  body('name').trim().notEmpty().withMessage('Course name is required.'),
  body('description').optional().trim().isString(),
  body('classDays').isArray({ min: 2, max: 2 }).withMessage('Please select exactly 2 class days.'),
  body('classDays.*').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid class day.'),
  body('startDate').isISO8601().withMessage('A valid start date is required.'),
  body('endDate').isISO8601().withMessage('A valid end date is required.'),
  body('classDays').custom((value) => {
    const normalized = Array.isArray(value) ? value.map((item) => String(item)) : [];
    if (new Set(normalized).size !== normalized.length) {
      throw new Error('Please choose two different days.');
    }
    return true;
  })
];

export const updateCourseValidation = [
  body('name').optional().trim().notEmpty().withMessage('Course name cannot be empty.'),
  body('description').optional().trim().isString(),
  body('classDays').optional().isArray({ min: 2, max: 2 }).withMessage('Please select exactly 2 class days.'),
  body('classDays.*').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid class day.'),
  body('startDate').optional().isISO8601().withMessage('A valid start date is required.'),
  body('endDate').optional().isISO8601().withMessage('A valid end date is required.'),
  body('classDays').optional().custom((value) => {
    const normalized = Array.isArray(value) ? value.map((item) => String(item)) : [];
    if (normalized.length && new Set(normalized).size !== normalized.length) {
      throw new Error('Please choose two different days.');
    }
    return true;
  })
];
