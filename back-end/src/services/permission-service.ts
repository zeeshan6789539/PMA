import { eq, desc } from 'drizzle-orm';
import { db } from '@/config/database';
import { permissions } from '@/database/schema';

export type PermissionCreateInput = {
  name: string;
  resource: string;
  action: string;
  description?: string | null;
};

export type PermissionUpdateInput = {
  name?: string;
  resource?: string;
  action?: string;
  description?: string | null;
};

/** List all permissions */
export async function list() {
  return db
    .select()
    .from(permissions)
    .orderBy(desc(permissions.createdAt));
}

/** Find permission by id */
export async function findById(id: string) {
  const [permission] = await db
    .select()
    .from(permissions)
    .where(eq(permissions.id, id))
    .limit(1);
  return permission ?? null;
}

/** Check if permission name exists (returns id if exists) */
export async function existsByName(name: string): Promise<string | null> {
  const [row] = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.name, name))
    .limit(1);
  return row?.id ?? null;
}

/** Create a new permission */
export async function create(data: PermissionCreateInput) {
  const [inserted] = await db
    .insert(permissions)
    .values({
      name: data.name,
      resource: data.resource,
      action: data.action,
      description: data.description ?? null,
    })
    .returning();
  return inserted ?? null;
}

/** Update a permission */
export async function update(id: string, data: PermissionUpdateInput) {
  const updatePayload: Record<string, unknown> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.resource !== undefined) updatePayload.resource = data.resource;
  if (data.action !== undefined) updatePayload.action = data.action;
  if (data.description !== undefined) updatePayload.description = data.description;

  const [updated] = await db
    .update(permissions)
    .set(updatePayload)
    .where(eq(permissions.id, id))
    .returning();
  return updated ?? null;
}

/** Delete a permission by id */
export async function remove(id: string) {
  const [deleted] = await db
    .delete(permissions)
    .where(eq(permissions.id, id))
    .returning({ id: permissions.id });
  return deleted ?? null;
}
