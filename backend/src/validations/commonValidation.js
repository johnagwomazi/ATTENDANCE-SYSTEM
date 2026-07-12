import { param } from 'express-validator';

export const idParamValidation = [
  param('id').isUUID().withMessage('A valid resource ID is required.')
];
