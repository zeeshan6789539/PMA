import { Request, Response, NextFunction } from 'express';
import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import ResponseHandler from '../utils/responseHandler.ts';

/** Centralized validation messages */
const MSG = {
  email: 'Please provide a valid email address',
  password: 'Password must be at least 6 characters long',
  passwordRequired: 'Password is required',
  name: 'Name must be between 2 and 50 characters',
  permissionName: 'Permission name must be between 2 and 50 characters',
  resource: 'Resource must be between 2 and 50 characters',
  action: 'Action must be between 2 and 50 characters',
  idRequired: 'ID is required',
  page: 'Page must be a positive integer',
  limit: 'Limit must be between 1 and 100',
} as const;

/**
 * Validation middleware – runs after express-validator chains.
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formattedErrors = errors.array().map((err) => ({
    field: 'path' in err ? err.path : (err as { param?: string }).param,
    message: err.msg,
    value: 'value' in err ? err.value : undefined,
  }));

  return ResponseHandler.validationError(res, 'Validation failed', formattedErrors);
};

/** Reusable body chains */
const bodyEmail = (): ValidationChain =>
  body('email').trim().isEmail().normalizeEmail().withMessage(MSG.email);

const bodyPassword = (minLength = 6): ValidationChain =>
  body('password')
    .isLength({ min: minLength })
    .withMessage(MSG.password);

const bodyRequiredPassword = (): ValidationChain =>
  body('password').notEmpty().withMessage(MSG.passwordRequired);

const bodyLength = (
  field: string,
  min: number,
  max: number,
  message: string
): ValidationChain =>
  body(field).trim().isLength({ min, max }).withMessage(message);

/** Auth validation chains */
export const authValidations = {
  signup: [
    bodyLength('name', 2, 50, MSG.name),
    bodyEmail(),
    bodyPassword(),
  ],
  login: [bodyEmail(), bodyRequiredPassword()],
};

/** Optional chains for query/params (e.g. pagination, id) */
export const queryValidations = {
  page: query('page').optional().isInt({ min: 1 }).toInt().withMessage(MSG.page),
  limit: query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage(MSG.limit),
};
export const paramValidations = {
  id: param('id').notEmpty().withMessage(MSG.idRequired),
};

export { MSG, bodyEmail, bodyPassword, bodyRequiredPassword, bodyLength };
