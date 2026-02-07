import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq, desc, sql, or, ilike } from 'drizzle-orm';
import { db } from '@/config/database';
import { users } from '@/database/schema';
import { roles } from '@/database/schema';
import ResponseHandler from '@/utils/responseHandler';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError } from '@/middleware/errorHandler';
import { SALT_ROUNDS } from '@/utils/constant';

/** List users with optional pagination and search */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .orderBy(desc(users.createdAt));

  if (search && typeof search === 'string') {
    const searchPattern = `%${search}%`;
    query = query.where(
      or(ilike(users.name, searchPattern), ilike(users.email, searchPattern))
    ) as typeof query;
  }

  const items = await query.limit(Number(limit)).offset(offset);
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  return ResponseHandler.success(res, 'Users retrieved successfully', {
    users: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: countResult?.count ?? 0,
    },
  });
});

/** Get a single user by id */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return ResponseHandler.success(res, 'User retrieved successfully', user);
});

/** Create a new user */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, roleId, isActive } = req.body;

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
      roleId: roleId || null,
      isActive: isActive ?? true,
    })
    .returning();

  if (!inserted) {
    return ResponseHandler.error(res, 'Failed to create user', 500);
  }

  const { password: _p, ...user } = inserted;
  return ResponseHandler.success(res, 'User created successfully', user, 201);
});

/** Update a user */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, email, password, roleId, isActive } = req.body;

  const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  if (!existing) {
    throw new NotFoundError('User not found');
  }

  const updateData: Record<string, any> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (roleId !== undefined) updateData.roleId = roleId;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (password) updateData.password = await bcrypt.hash(password, SALT_ROUNDS);

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  if (!updated) {
    return ResponseHandler.error(res, 'Failed to update user', 500);
  }

  const { password: _p, ...user } = updated;
  return ResponseHandler.success(res, 'User updated successfully', user);
});

/** Delete a user */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!deleted) {
    throw new NotFoundError('User not found');
  }

  return ResponseHandler.success(res, 'User deleted successfully');
});
