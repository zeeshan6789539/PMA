import { Request, Response } from 'express';
import ResponseHandler from '@/utils/response-handler';
import { asyncHandler } from '@/middleware/error-handler';
import { NotFoundError } from '@/middleware/error-handler';
import { permissionService } from '@/services';

/** List all permissions */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const items = await permissionService.list();
  return ResponseHandler.success(res, 'Permissions retrieved successfully', items);
});

/** Get a single permission by id */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const permission = await permissionService.findById(id);

  if (!permission) {
    throw new NotFoundError('Permission not found');
  }

  return ResponseHandler.success(res, 'Permission retrieved successfully', permission);
});

/** Create a new permission */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, resource, action, description } = req.body;

  const existingId = await permissionService.existsByName(name);
  if (existingId) {
    return ResponseHandler.error(res, 'A permission with this name already exists', 409);
  }

  const inserted = await permissionService.create({
    name,
    resource,
    action,
    description: description ?? null,
  });

  if (!inserted) {
    return ResponseHandler.error(res, 'Failed to create permission', 500);
  }

  return ResponseHandler.success(res, 'Permission created successfully', inserted, 201);
});

/** Update a permission */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, resource, action, description } = req.body;

  const existing = await permissionService.findById(id);
  if (!existing) {
    throw new NotFoundError('Permission not found');
  }

  const updateData: permissionService.PermissionUpdateInput = {};
  if (name !== undefined) updateData.name = name;
  if (resource !== undefined) updateData.resource = resource;
  if (action !== undefined) updateData.action = action;
  if (description !== undefined) updateData.description = description;

  const updated = await permissionService.update(id, updateData);
  if (!updated) {
    return ResponseHandler.error(res, 'Failed to update permission', 500);
  }

  return ResponseHandler.success(res, 'Permission updated successfully', updated);
});

/** Delete a permission */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await permissionService.remove(id);

  if (!deleted) {
    throw new NotFoundError('Permission not found');
  }

  return ResponseHandler.success(res, 'Permission deleted successfully');
});
