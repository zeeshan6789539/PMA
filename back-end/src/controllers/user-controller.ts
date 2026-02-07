import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import ResponseHandler from '@/utils/response-handler';
import { asyncHandler } from '@/middleware/error-handler';
import { NotFoundError } from '@/middleware/error-handler';
import { SALT_ROUNDS } from '@/utils/constant';
import { userService } from '@/services';

/** List users with optional pagination and search */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search } = req.query;
  const filters: Parameters<typeof userService.list>[0] = {
    page: Number(page),
    limit: Number(limit),
  };
  if (typeof search === 'string') filters.search = search;
  const { users: items, total } = await userService.list(filters);

  return ResponseHandler.success(res, 'Users retrieved successfully', {
    users: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
  });
});

/** Get a single user by id */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await userService.findById(id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return ResponseHandler.success(res, 'User retrieved successfully', user);
});

/** Create a new user */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, roleId, isActive } = req.body;

  const existingId = await userService.existsByEmail(email);
  if (existingId) {
    return ResponseHandler.error(res, 'An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const inserted = await userService.create({
    name,
    email,
    password: hashedPassword,
    roleId: roleId ?? null,
    isActive: isActive ?? true,
  });

  if (!inserted) {
    return ResponseHandler.error(res, 'Failed to create user', 500);
  }

  const { password: _p, ...user } = inserted;
  return ResponseHandler.success(res, 'User created successfully', user, 201);
});

/** Update a user (password cannot be changed via this route; use change-password) */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, email, roleId, isActive } = req.body;

  const existing = await userService.findById(id);
  if (!existing) {
    throw new NotFoundError('User not found');
  }

  const updateData: userService.UserUpdateInput = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (roleId !== undefined) updateData.roleId = roleId;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await userService.update(id, updateData);
  if (!updated) {
    return ResponseHandler.error(res, 'Failed to update user', 500);
  }

  const { password: _p, ...user } = updated;
  return ResponseHandler.success(res, 'User updated successfully', user);
});

/** Delete a user */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await userService.remove(id);

  if (!deleted) {
    throw new NotFoundError('User not found');
  }

  return ResponseHandler.success(res, 'User deleted successfully');
});
