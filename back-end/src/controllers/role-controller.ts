import { Request, Response } from 'express';
import ResponseHandler from '@/utils/response-handler';
import { asyncHandler } from '@/middleware/error-handler';
import { NotFoundError } from '@/middleware/error-handler';
import { roleService } from '@/services';

/** List all roles */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const items = await roleService.listWithPermissionCounts();
  return ResponseHandler.success(res, 'Roles retrieved successfully', items);
});

/** Get a single role by id with its permissions */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const roleWithPerms = await roleService.findByIdWithPermissions(id);

  if (!roleWithPerms) {
    throw new NotFoundError('Role not found');
  }

  return ResponseHandler.success(res, 'Role retrieved successfully', roleWithPerms);
});

/** Create a new role */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  const existingId = await roleService.existsByName(name);
  if (existingId) {
    return ResponseHandler.error(res, 'A role with this name already exists', 409);
  }

  const inserted = await roleService.create(name);
  if (!inserted) {
    return ResponseHandler.error(res, 'Failed to create role', 500);
  }

  return ResponseHandler.success(res, 'Role created successfully', inserted, 201);
});

/** Update a role */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name } = req.body;

  const existing = await roleService.findById(id);
  if (!existing) {
    throw new NotFoundError('Role not found');
  }

  const updated = await roleService.update(id, name);
  if (!updated) {
    return ResponseHandler.error(res, 'Failed to update role', 500);
  }

  return ResponseHandler.success(res, 'Role updated successfully', updated);
});

/** Delete a role */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await roleService.remove(id);

  if (!deleted) {
    throw new NotFoundError('Role not found');
  }

  return ResponseHandler.success(res, 'Role deleted successfully');
});

/** Assign permissions to a role */
export const assignPermissions = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { permissionIds } = req.body;

  const role = await roleService.findById(id);
  if (!role) {
    throw new NotFoundError('Role not found');
  }

  const { role: _r, permissions: rolePerms } = await roleService.assignPermissions(
    id,
    permissionIds as string[]
  );

  return ResponseHandler.success(res, 'Permissions assigned successfully', {
    role,
    permissions: rolePerms,
  });
});

/** Remove permissions from a role */
export const removePermissions = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { permissionIds } = req.body;

  const role = await roleService.findById(id);
  if (!role) {
    throw new NotFoundError('Role not found');
  }

  if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
    return ResponseHandler.error(res, 'permissionIds array is required', 400);
  }

  const { permissions: rolePerms } = await roleService.removePermissions(id, permissionIds);

  return ResponseHandler.success(res, 'Permissions removed successfully', {
    role,
    permissions: rolePerms,
  });
});
