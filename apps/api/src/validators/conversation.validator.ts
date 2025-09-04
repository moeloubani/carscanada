import { body, param, query, ValidationChain } from 'express-validator';

export const startConversationValidator: ValidationChain[] = [
  body('listingId')
    .trim()
    .notEmpty()
    .withMessage('Listing ID is required')
    .isUUID()
    .withMessage('Invalid listing ID format'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Initial message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
];

export const sendMessageValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid conversation ID format'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
];

export const conversationIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid conversation ID format'),
];

export const paginationValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const messagesPaginationValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid conversation ID format'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
    .toInt(),
  query('before')
    .optional()
    .isISO8601()
    .withMessage('Before must be a valid ISO 8601 date'),
];