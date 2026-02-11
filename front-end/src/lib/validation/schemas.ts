import { z } from 'zod';

/** Base validation messages matching backend */
const MSG = {
  email: 'Please provide a valid email address',
  password: 'Password must be at least 6 characters long',
  passwordRequired: 'Password is required',
  name: 'Name must be between 2 and 50 characters',
  permissionName: 'Permission name must be between 2 and 100 characters',
  resource: 'Resource must be between 2 and 50 characters',
  action: 'Action must be between 2 and 50 characters',
  idRequired: 'ID is required',
  currentPasswordRequired: 'Current password is required',
  newPasswordRequired: 'New password is required',
  newPasswordDifferent: 'New password must be different from current password',
  confirmPasswordMatch: 'Passwords do not match',
} as const;

/** Base schemas */
const emailSchema = z.string().trim().min(1, MSG.email).email(MSG.email);
const passwordSchema = z.string().min(6, MSG.password);
const requiredPasswordSchema = z.string().min(1, MSG.passwordRequired);
const nameSchema = z.string().trim().min(2, MSG.name).max(50, MSG.name);
const permissionNameSchema = z.string().trim().min(2, MSG.permissionName).max(100, MSG.permissionName);
const resourceSchema = z.string().trim().min(2, MSG.resource).max(50, MSG.resource);
const actionSchema = z.string().trim().min(2, MSG.action).max(50, MSG.action);
const uuidSchema = z.string().uuid('Invalid ID format');

/** Auth schemas */
export const loginSchema = z.object({
  email: emailSchema,
  password: requiredPasswordSchema,
});

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, MSG.currentPasswordRequired),
    newPassword: z.string().min(1, MSG.newPasswordRequired).min(6, MSG.password),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: MSG.newPasswordDifferent,
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: MSG.confirmPasswordMatch,
    path: ['confirmPassword'],
  });

/** User schemas */
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  roleId: uuidSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  roleId: uuidSchema.optional(),
  isActive: z.boolean().optional(),
});

/** Role schemas */
export const createRoleSchema = z.object({
  name: nameSchema,
});

export const updateRoleSchema = z.object({
  name: nameSchema,
});

export const assignPermissionsSchema = z.object({
  permissionIds: z.array(uuidSchema).min(1, 'permissionIds cannot be empty'),
});

/** Permission schemas */
export const createPermissionSchema = z.object({
  name: permissionNameSchema,
  resource: resourceSchema,
  action: actionSchema,
  description: z.string().max(255, 'Description must be at most 255 characters').optional(),
});

export const updatePermissionSchema = z.object({
  name: permissionNameSchema.optional(),
  resource: resourceSchema.optional(),
  action: actionSchema.optional(),
  description: z.string().max(255, 'Description must be at most 255 characters').optional(),
});

/** Query schemas */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, MSG.idRequired),
});

/** Type exports */
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
