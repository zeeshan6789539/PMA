import { eq, desc, inArray, and, sql } from 'drizzle-orm';
import { db } from '@/config/database';
import { roles, permissions, rolePermissions } from '@/database/schema';

export type PermissionSummary = {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
};

/** List all roles with their permission count */
export async function listWithPermissionCounts() {
  return db
    .select({
      id: roles.id,
      name: roles.name,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt,
      permissionCount: sql<number>`count(${rolePermissions.permissionId})`,
    })
    .from(roles)
    .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .groupBy(roles.id)
    .orderBy(desc(roles.createdAt));
}

/** List all roles */
export async function list() {
  return db
    .select()
    .from(roles)
    .orderBy(desc(roles.createdAt));
}

/** Find role by id */
export async function findById(id: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  return role ?? null;
}

/** Find role by id with its permissions */
export async function findByIdWithPermissions(id: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role) return null;

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

  return { ...role, permissions: rolePerms };
}

/** Check if role name exists (returns id if exists) */
export async function existsByName(name: string): Promise<string | null> {
  const [row] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, name))
    .limit(1);
  return row?.id ?? null;
}

/** Create a new role */
export async function create(name: string) {
  const [inserted] = await db.insert(roles).values({ name }).returning();
  return inserted ?? null;
}

/** Update a role */
export async function update(id: string, name: string) {
  const [updated] = await db
    .update(roles)
    .set({ name })
    .where(eq(roles.id, id))
    .returning();
  return updated ?? null;
}

/** Delete a role by id */
export async function remove(id: string) {
  const [deleted] = await db
    .delete(roles)
    .where(eq(roles.id, id))
    .returning({ id: roles.id });
  return deleted ?? null;
}

/** Assign permissions to a role */
export async function assignPermissions(roleId: string, permissionIds: string[]) {
  const values = permissionIds.map((permissionId) => ({
    roleId,
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
    .where(eq(rolePermissions.roleId, roleId));

  const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  return { role: role ?? null, permissions: rolePerms };
}

/** Remove permissions from a role */
export async function removePermissions(roleId: string, permissionIds: string[]) {
  await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
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
    .where(eq(rolePermissions.roleId, roleId));

  const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  return { role: role ?? null, permissions: rolePerms };
}
