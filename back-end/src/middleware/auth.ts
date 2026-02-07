import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '@/config/database';
import { users, roles } from '@/database/schema';
import { UnauthorizedError, ForbiddenError } from '@/middleware/error-handler';
import { asyncHandler } from '@/middleware/error-handler';
import { SUPER_ADMIN_ROLE_NAME } from '@/utils/constant';

/** JWT payload shape (must match what auth-controller signs) */
export interface JwtPayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const BEARER_PREFIX = 'Bearer ';

/**
 * Middleware: verify JWT from Authorization header and check expiration.
 * - Expects header: Authorization: Bearer <token>
 * - Sets req.user to decoded payload (id, email) on success.
 * - Responds 401 when token is missing, invalid, or expired.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    // jwt.verify throws TokenExpiredError or JsonWebTokenError
    // Let them bubble; errorHandler converts to UnauthorizedError with appropriate message
    throw err;
  }
};

/**
 * Middleware: ensure the authenticated user has the Super Admin role.
 * Must be used after authenticate (req.user must be set).
 * Returns 401 if not authenticated, 403 if not super admin.
 */
export const requireSuperAdmin = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const [row] = await db
    .select({ roleName: roles.name })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, req.user.id as string))
    .limit(1);

  if (!row?.roleName || row.roleName !== SUPER_ADMIN_ROLE_NAME) {
    throw new ForbiddenError('Super admin access required');
  }

  next();
});
