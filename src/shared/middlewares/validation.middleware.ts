import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/AppError';

/**
 * Validation middleware to check for validation errors
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => `${error.type === 'field' ? error.path : 'field'}: ${error.msg}`)
      .join(', ');

    return next(new ValidationError(errorMessages));
  }

  next();
};

/**
 * Common validation rules
 */
export const ValidationRules = {
  // Email validation
  email: () => body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),

  // Password validation
  password: () =>
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),

  // UUID validation
  uuid: (field: string = 'id') =>
    param(field).isUUID().withMessage(`${field} must be a valid UUID`),

  // String validation
  string: (field: string, min: number = 1, max: number = 255) =>
    body(field)
      .isString()
      .trim()
      .isLength({ min, max })
      .withMessage(`${field} must be between ${min} and ${max} characters`),

  // Number validation
  number: (field: string, min?: number, max?: number) => {
    let validation = body(field).isNumeric().withMessage(`${field} must be a number`);
    if (min !== undefined) {
      validation = validation.isFloat({ min }).withMessage(`${field} must be at least ${min}`);
    }
    if (max !== undefined) {
      validation = validation.isFloat({ max }).withMessage(`${field} must be at most ${max}`);
    }
    return validation;
  },

  // Boolean validation
  boolean: (field: string) => body(field).isBoolean().withMessage(`${field} must be a boolean`),

  // Date validation
  date: (field: string) => body(field).isISO8601().withMessage(`${field} must be a valid date`),

  // Array validation
  array: (field: string, min?: number, max?: number) => {
    let validation = body(field).isArray().withMessage(`${field} must be an array`);
    if (min !== undefined) {
      validation = validation
        .isArray({ min })
        .withMessage(`${field} must contain at least ${min} items`);
    }
    if (max !== undefined) {
      validation = validation
        .isArray({ max })
        .withMessage(`${field} must contain at most ${max} items`);
    }
    return validation;
  },

  // URL validation
  url: (field: string) => body(field).isURL().withMessage(`${field} must be a valid URL`),

  // Phone validation
  phone: (field: string) =>
    body(field).isMobilePhone('any').withMessage(`${field} must be a valid phone number`),

  // Pagination validation
  pagination: () => [
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
  ],

  // Sanitize input to prevent XSS
  sanitize: (field: string) => body(field).trim().escape(),
};

/**
 * Create custom validation chain
 */
export const createValidation = (rules: ValidationChain[]) => {
  return [...rules, validate];
};
