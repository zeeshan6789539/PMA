import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ResponseHandler from '@/utils/response-handler';
import { asyncHandler } from '@/middleware/error-handler';
import { UnauthorizedError } from '@/middleware/error-handler';
import { gethashedpassword, comparePassword } from '@/utils/helper';
import { userService, roleService } from '@/services';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingId = await userService.existsByEmail(email);
  if (existingId) {
    return ResponseHandler.error(res, 'An account with this email already exists', 409);
  }

  const hashedPassword = await gethashedpassword(password);
  const inserted = await userService.create({
    name,
    email,
    password: hashedPassword,
  });

  if (!inserted) {
    return ResponseHandler.error(res, 'Failed to create account', 500);
  }

  const { password: _p, ...user } = inserted;
  return ResponseHandler.success(res, 'Account created successfully', user, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  const expiresInSeconds = Number(process.env.JWT_EXPIRES_IN) || 7 * 24 * 60 * 60;
  const token = jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: expiresInSeconds }
  );

  const { password: _, ...userWithoutPassword } = user;

  // Get role details with permissions if roleId exists
  let role = null;
  if (user.roleId) {
    role = await roleService.findByIdWithPermissions(user.roleId);
  }

  return ResponseHandler.success(res, 'Login successful', {
    user: userWithoutPassword,
    role,
    token,
  });
});

/** Change password for the authenticated user */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  const user = await userService.findByEmail(req.user!.email);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    return ResponseHandler.error(res, 'Current password is incorrect', 400);
  }

  const hashedPassword = await gethashedpassword(newPassword);
  await userService.update(user.id, { password: hashedPassword });

  return ResponseHandler.success(res, 'Password changed successfully');
});
