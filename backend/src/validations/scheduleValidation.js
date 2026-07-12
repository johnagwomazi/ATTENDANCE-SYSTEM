import { body, param } from 'express-validator';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export const createScheduleValidation = [
  body('courseId').isUUID().withMessage('A valid course ID is required.'),
  body('dayOfWeek').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day of week.'),
  body('startTime').matches(timePattern).withMessage('A valid start time is required.'),
  body('endTime').matches(timePattern).withMessage('A valid end time is required.')
];

export const updateScheduleValidation = [
  param('id').isUUID().withMessage('A valid schedule ID is required.'),
  body('courseId').optional().isUUID().withMessage('A valid course ID is required.'),
  body('dayOfWeek').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day of week.'),
  body('startTime').optional().matches(timePattern).withMessage('A valid start time is required.'),
  body('endTime').optional().matches(timePattern).withMessage('A valid end time is required.')
];
