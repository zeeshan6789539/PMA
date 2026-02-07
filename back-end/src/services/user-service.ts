import { eq, desc, sql, or, ilike } from 'drizzle-orm';
import { db } from '@/config/database';
import { users, roles } from '@/database/schema';

export type UserListFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  roleName: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type UserCreateInput = {
  name: string;
  email: string;
  password: string;
  roleId?: string | null;
  isActive?: boolean;
};

export type UserUpdateInput = {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string | null;
  isActive?: boolean;
};

/** Find user by email (returns full row including password) */
export async function findByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

/** Find user by id (with role name, no password) */
export async function findById(id: string): Promise<UserListItem | null> {
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
  return user ?? null;
}

/** Check if email is taken (returns id if exists) */
export async function existsByEmail(email: string): Promise<string | null> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return row?.id ?? null;
}

/** List users with pagination and optional search */
export async function list(filters: UserListFilters) {
  const { page = 1, limit = 10, search } = filters;
  const offset = (page - 1) * limit;

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

  const items = await query.limit(limit).offset(offset);
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  return {
    users: items,
    total: countResult?.count ?? 0,
  };
}

/** Create a new user (pass hashed password) */
export async function create(data: UserCreateInput & { password: string }) {
  const [inserted] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      password: data.password,
      roleId: data.roleId ?? null,
      isActive: data.isActive ?? true,
    })
    .returning();
  return inserted ?? null;
}

/** Update a user (pass hashed password if changing) */
export async function update(id: string, data: UserUpdateInput) {
  const updatePayload: Record<string, unknown> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.roleId !== undefined) updatePayload.roleId = data.roleId;
  if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
  if (data.password !== undefined) updatePayload.password = data.password;

  const [updated] = await db
    .update(users)
    .set(updatePayload)
    .where(eq(users.id, id))
    .returning();
  return updated ?? null;
}

/** Delete a user by id */
export async function remove(id: string) {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return deleted ?? null;
}
