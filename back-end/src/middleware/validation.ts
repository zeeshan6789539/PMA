import { Request, Response, NextFunction } from 'express';
import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import ResponseHandler from '@/utils/response-handler';

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

/** User validation chains */
export const userValidations = {
  list: [queryValidations.page, queryValidations.limit],
  getById: [paramValidations.id],
  create: [
    bodyLength('name', 2, 50, MSG.name),
    bodyEmail(),
    bodyPassword(),
    body('roleId').optional().isUUID().withMessage('Role ID must be a valid UUID'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  ],
  update: [
    paramValidations.id,
    bodyLength('name', 2, 50, MSG.name).optional(),
    bodyEmail().optional(),
    body('password').optional().isLength({ min: 6 }).withMessage(MSG.password),
    body('roleId').optional().isUUID().withMessage('Role ID must be a valid UUID'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  ],
  remove: [paramValidations.id],
};

/** Role validation chains */
export const roleValidations = {
  list: [],
  getById: [paramValidations.id],
  create: [bodyLength('name', 2, 50, 'Role name must be between 2 and 50 characters')],
  update: [
    paramValidations.id,
    bodyLength('name', 2, 50, 'Role name must be between 2 and 50 characters'),
  ],
  remove: [paramValidations.id],
  assignPermissions: [
    paramValidations.id,
    body('permissionIds')
      .isArray()
      .withMessage('permissionIds must be an array')
      .notEmpty()
      .withMessage('permissionIds cannot be empty'),
    body('permissionIds.*').isUUID().withMessage('Each permission ID must be a valid UUID'),
  ],
  removePermissions: [
    paramValidations.id,
    body('permissionIds')
      .isArray()
      .withMessage('permissionIds must be an array')
      .notEmpty()
      .withMessage('permissionIds cannot be empty'),
    body('permissionIds.*').isUUID().withMessage('Each permission ID must be a valid UUID'),
  ],
};

/** Permission validation chains */
export const permissionValidations = {
  list: [],
  getById: [paramValidations.id],
  create: [
    bodyLength('name', 2, 100, MSG.permissionName),
    bodyLength('resource', 2, 50, MSG.resource),
    bodyLength('action', 2, 50, MSG.action),
    body('description').optional().isLength({ max: 255 }).withMessage('Description must be at most 255 characters'),
  ],
  update: [
    paramValidations.id,
    bodyLength('name', 2, 100, MSG.permissionName).optional(),
    bodyLength('resource', 2, 50, MSG.resource).optional(),
    bodyLength('action', 2, 50, MSG.action).optional(),
    body('description').optional().isLength({ max: 255 }).withMessage('Description must be at most 255 characters'),
  ],
  remove: [paramValidations.id],
};

export { MSG, bodyEmail, bodyPassword, bodyRequiredPassword, bodyLength };
