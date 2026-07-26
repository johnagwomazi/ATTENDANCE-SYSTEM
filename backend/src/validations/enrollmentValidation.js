import { body, param } from 'express-validator';

const sessionValues = ['morning', 'afternoon'];

export const createEnrollmentValidation = [
  body('studentId').isUUID().withMessage('A valid student ID is required.'),
  body('courseId').isUUID().withMessage('A valid course ID is required.'),
  body('session').isIn(sessionValues).withMessage('Please select a valid session.'),
  body('enrollmentStatus').optional().isIn(['active', 'completed', 'expired', 'suspended']).withMessage('Invalid enrollment status.'),
  body('programStartDate').optional().isISO8601().withMessage('A valid program start date is required.'),
  body('programEndDate').optional().isISO8601().withMessage('A valid program end date is required.')
];

export const updateEnrollmentValidation = [
  param('id').isUUID().withMessage('A valid enrollment ID is required.'),
  body('studentId').optional().isUUID().withMessage('A valid student ID is required.'),
  body('courseId').optional().isUUID().withMessage('A valid course ID is required.'),
  body('session').optional().isIn(sessionValues).withMessage('Please select a valid session.'),
  body('programStartDate').optional().isISO8601().withMessage('A valid program start date is required.'),
  body('programEndDate').optional().isISO8601().withMessage('A valid program end date is required.'),
  body('enrollmentStatus').optional().isIn(['active', 'completed', 'expired', 'suspended']).withMessage('Invalid enrollment status.')
];
