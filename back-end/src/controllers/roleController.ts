import { Request, Response } from 'express';
import { eq, desc, inArray, and } from 'drizzle-orm';
import { db } from '@/config/database';
import { roles, permissions, rolePermissions } from '@/database/schema';
import ResponseHandler from '@/utils/responseHandler';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError } from '@/middleware/errorHandler';

/** List all roles */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const items = await db
    .select()
    .from(roles)
    .orderBy(desc(roles.createdAt));

  return ResponseHandler.success(res, 'Roles retrieved successfully', items);
});

/** Get a single role by id with its permissions */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);

  if (!role) {
    throw new NotFoundError('Role not found');
  }

  const rolePerms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
      description: permissions.description,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id));

  return ResponseHandler.success(res, 'Role retrieved successfully', {
    ...role,
    permissions: rolePerms,
  });
});

/** Create a new role */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  const [existing] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, name))
    .limit(1);

  if (existing) {
    return ResponseHandler.error(res, 'A role with this name already exists', 409);
  }

  const [inserted] = await db.insert(roles).values({ name }).returning();

  if (!inserted) {
    return ResponseHandler.error(res, 'Failed to create role', 500);
  }

  return ResponseHandler.success(res, 'Role created successfully', inserted, 201);
});

/** Update a role */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name } = req.body;

  const [existing] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);

  if (!existing) {
    throw new NotFoundError('Role not found');
  }

  const [updated] = await db
    .update(roles)
    .set({ name })
    .where(eq(roles.id, id))
    .returning();

  if (!updated) {
    return ResponseHandler.error(res, 'Failed to update role', 500);
  }

  return ResponseHandler.success(res, 'Role updated successfully', updated);
});

/** Delete a role */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const [deleted] = await db
    .delete(roles)
    .where(eq(roles.id, id))
    .returning({ id: roles.id });

  if (!deleted) {
    throw new NotFoundError('Role not found');
  }

  return ResponseHandler.success(res, 'Role deleted successfully');
});

/** Assign permissions to a role */
export const assignPermissions = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { permissionIds } = req.body;

  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);

  if (!role) {
    throw new NotFoundError('Role not found');
  }

  const values = (permissionIds as string[]).map((permissionId: string) => ({
    roleId: id,
    permissionId,
  }));

  await db
    .insert(rolePermissions)
    .values(values)
    .onConflictDoNothing({ target: [rolePermissions.roleId, rolePermissions.permissionId] });

  const rolePerms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id));

  return ResponseHandler.success(res, 'Permissions assigned successfully', {
    role,
    permissions: rolePerms,
  });
});

/** Remove permissions from a role */
export const removePermissions = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { permissionIds } = req.body;

  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);

  if (!role) {
    throw new NotFoundError('Role not found');
  }

  if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
    return ResponseHandler.error(res, 'permissionIds array is required', 400);
  }

  await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, id),
        inArray(rolePermissions.permissionId, permissionIds)
      )
    );

  const rolePerms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id));

  return ResponseHandler.success(res, 'Permissions removed successfully', {
    role,
    permissions: rolePerms,
  });
});
