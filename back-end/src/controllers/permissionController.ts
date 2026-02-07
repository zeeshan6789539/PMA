import { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/config/database';
import { permissions } from '@/database/schema';
import ResponseHandler from '@/utils/responseHandler';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError } from '@/middleware/errorHandler';

/** List all permissions */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const items = await db
    .select()
    .from(permissions)
    .orderBy(desc(permissions.createdAt));

  return ResponseHandler.success(res, 'Permissions retrieved successfully', items);
});

/** Get a single permission by id */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const [permission] = await db
    .select()
    .from(permissions)
    .where(eq(permissions.id, id))
    .limit(1);

  if (!permission) {
    throw new NotFoundError('Permission not found');
  }

  return ResponseHandler.success(res, 'Permission retrieved successfully', permission);
});

/** Create a new permission */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, resource, action, description } = req.body;

  const [existing] = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.name, name))
    .limit(1);

  if (existing) {
    return ResponseHandler.error(res, 'A permission with this name already exists', 409);
  }

  const [inserted] = await db
    .insert(permissions)
    .values({ name, resource, action, description: description || null })
    .returning();

  if (!inserted) {
    return ResponseHandler.error(res, 'Failed to create permission', 500);
  }

  return ResponseHandler.success(res, 'Permission created successfully', inserted, 201);
});

/** Update a permission */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, resource, action, description } = req.body;

  const [existing] = await db
    .select()
    .from(permissions)
    .where(eq(permissions.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Permission not found');
  }

  const updateData: Record<string, any> = {};
  if (name !== undefined) updateData.name = name;
  if (resource !== undefined) updateData.resource = resource;
  if (action !== undefined) updateData.action = action;
  if (description !== undefined) updateData.description = description;

  const [updated] = await db
    .update(permissions)
    .set(updateData)
    .where(eq(permissions.id, id))
    .returning();

  if (!updated) {
    return ResponseHandler.error(res, 'Failed to update permission', 500);
  }

  return ResponseHandler.success(res, 'Permission updated successfully', updated);
});

/** Delete a permission */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const [deleted] = await db
    .delete(permissions)
    .where(eq(permissions.id, id))
    .returning({ id: permissions.id });

  if (!deleted) {
    throw new NotFoundError('Permission not found');
  }

  return ResponseHandler.success(res, 'Permission deleted successfully');
});
