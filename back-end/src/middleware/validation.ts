import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import ResponseHandler from '../utils/responseHandler.js';

/**
 * Validation Middleware
 * Checks for validation errors and returns formatted response
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: any) => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return ResponseHandler.validationError(res, 'Validation failed', formattedErrors);
  }

  next();
};

/**
 * Common Validation Rules
 */
export const commonValidations = {
  // User validations
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Please provide a valid email address'
    },
    normalizeEmail: true
  },

  password: {
    in: ['body'],
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    }
  },

  name: {
    in: ['body'],
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'Name must be between 2 and 50 characters'
    },
    trim: true
  },

  // Permission validations
  permissionName: {
    in: ['body'],
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'Permission name must be between 2 and 50 characters'
    },
    trim: true
  },

  resource: {
    in: ['body'],
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'Resource must be between 2 and 50 characters'
    },
    trim: true
  },

  action: {
    in: ['body'],
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'Action must be between 2 and 50 characters'
    },
    trim: true
  },

  // ID validation
  id: {
    in: ['params'],
    isLength: {
      options: { min: 1 },
      errorMessage: 'ID is required'
    }
  },

  // Pagination validations
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Page must be a positive integer'
    },
    toInt: true
  },

  limit: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Limit must be between 1 and 100'
    },
    toInt: true
  }
};