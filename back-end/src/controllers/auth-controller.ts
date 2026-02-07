import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ResponseHandler from '@/utils/response-handler';
import { asyncHandler } from '@/middleware/error-handler';
import { UnauthorizedError } from '@/middleware/error-handler';
import { SALT_ROUNDS } from '@/utils/constant';
import { userService } from '@/services';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingId = await userService.existsByEmail(email);
  if (existingId) {
    return ResponseHandler.error(res, 'An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
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

  const isMatch = await bcrypt.compare(password, user.password);
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
  return ResponseHandler.success(res, 'Login successful', {
    user: userWithoutPassword,
    token,
  });
});
