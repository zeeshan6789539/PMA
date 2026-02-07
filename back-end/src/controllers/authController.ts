import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '@/config/database';
import { users } from '@/database/schema';
import ResponseHandler from '@/utils/responseHandler';
import { asyncHandler } from '@/middleware/errorHandler';
import { UnauthorizedError } from '@/middleware/errorHandler';
import { SALT_ROUNDS } from '@/utils/constant';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return ResponseHandler.error(res, 'An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [inserted] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning();

  if (!inserted) {
    return ResponseHandler.error(res, 'Failed to create account', 500);
  }

  const { password: _p, ...user } = inserted;
  return ResponseHandler.success(res, 'Account created successfully', user, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

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

  // Token expires in 7 days (configurable via JWT_EXPIRES_IN as seconds, e.g. 604800)
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
