import { body, param } from 'express-validator';

export const createEnrollmentValidation = [
  body('studentId').isUUID().withMessage('A valid student ID is required.'),
  body('courseId').isUUID().withMessage('A valid course ID is required.'),
  body('programStartDate').isISO8601().withMessage('A valid program start date is required.'),
  body('programEndDate').isISO8601().withMessage('A valid program end date is required.'),
  body('enrollmentStatus').optional().isIn(['active', 'completed', 'expired', 'suspended']).withMessage('Invalid enrollment status.')
];

export const updateEnrollmentValidation = [
  param('id').isUUID().withMessage('A valid enrollment ID is required.'),
  body('studentId').optional().isUUID().withMessage('A valid student ID is required.'),
  body('courseId').optional().isUUID().withMessage('A valid course ID is required.'),
  body('programStartDate').optional().isISO8601().withMessage('A valid program start date is required.'),
  body('programEndDate').optional().isISO8601().withMessage('A valid program end date is required.'),
  body('enrollmentStatus').optional().isIn(['active', 'completed', 'expired', 'suspended']).withMessage('Invalid enrollment status.')
];
