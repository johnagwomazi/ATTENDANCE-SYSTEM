import { body, param } from 'express-validator';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timePattern = /^\d{2}:\d{2}(:\d{2})?$/;

export const createEnrollmentValidation = [
  body('studentId').isUUID().withMessage('A valid student ID is required.'),
  body('courseId').isUUID().withMessage('A valid course ID is required.'),
  body('programStartDate').isISO8601().withMessage('A valid program start date is required.'),
  body('programEndDate').isISO8601().withMessage('A valid program end date is required.'),
  body('enrollmentStatus').optional().isIn(['active', 'completed', 'expired', 'suspended']).withMessage('Invalid enrollment status.'),
  body('courseSchedules').optional().isArray().withMessage('Course schedules must be an array.'),
  body('courseSchedules.*.dayOfWeek').optional().isIn(dayNames).withMessage('Invalid schedule day.'),
  body('courseSchedules.*.startTime').optional().matches(timePattern).withMessage('A valid schedule start time is required.'),
  body('courseSchedules.*.endTime').optional().matches(timePattern).withMessage('A valid schedule end time is required.')
];

export const updateEnrollmentValidation = [
  param('id').isUUID().withMessage('A valid enrollment ID is required.'),
  body('studentId').optional().isUUID().withMessage('A valid student ID is required.'),
  body('courseId').optional().isUUID().withMessage('A valid course ID is required.'),
  body('programStartDate').optional().isISO8601().withMessage('A valid program start date is required.'),
  body('programEndDate').optional().isISO8601().withMessage('A valid program end date is required.'),
  body('enrollmentStatus').optional().isIn(['active', 'completed', 'expired', 'suspended']).withMessage('Invalid enrollment status.')
];
