import 'dotenv/config';
import { db } from '@/config/database.ts';
import { roles, permissions, rolePermissions, users } from '../schema/index.ts';
import { eq, and } from 'drizzle-orm';
import { gethashedpassword } from '@/utils/helper.ts';
import { DEV_TEMP_PASSWORD } from '@/utils/constant.ts';

/**
 * Seed Roles
 */
export const seedRoles = async () => {
  console.log('🌱 Seeding roles...');
  const rolesList = ['Super Admin', 'Member'];

  for (const roleName of rolesList) {
    const existing = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1).then((res: any[]) => res[0]);
    if (!existing) {
      await db.insert(roles).values({ name: roleName });
      console.log(`✅ Created role: ${roleName}`);
    } else {
      console.log(`⏭️  Role already exists: ${roleName}`);
    }
  }
};

/**
 * Seed Permissions
 */
export const seedPermissions = async () => {
  console.log('🌱 Seeding permissions...');
  const permissionsList = [
    // User permissions
    { name: 'user:create', resource: 'user', action: 'create', description: 'Can create new users' },
    { name: 'user:read', resource: 'user', action: 'read', description: 'Can view users' },
    { name: 'user:update', resource: 'user', action: 'update', description: 'Can update users' },
    { name: 'user:delete', resource: 'user', action: 'delete', description: 'Can delete users' },

    // Role permissions
    { name: 'role:create', resource: 'role', action: 'create', description: 'Can create new roles' },
    { name: 'role:read', resource: 'role', action: 'read', description: 'Can view roles' },
    { name: 'role:update', resource: 'role', action: 'update', description: 'Can update roles' },
    { name: 'role:delete', resource: 'role', action: 'delete', description: 'Can delete roles' },

    // Permission views
    { name: 'permission:read', resource: 'permission', action: 'read', description: 'Can view permissions' },
  ];

  for (const perm of permissionsList) {
    const existing = await db.select().from(permissions).where(eq(permissions.name, perm.name)).limit(1).then((res: any[]) => res[0]);
    if (!existing) {
      await db.insert(permissions).values(perm);
      console.log(`✅ Created permission: ${perm.name}`);
    } else {
      console.log(`⏭️  Permission already exists: ${perm.name}`);
    }
  }
};

/**
 * Seed Role Permissions
 */
export const seedRolePermissions = async () => {
  console.log('🌱 Seeding role-permissions...');

  const superAdminRole = await db.select().from(roles).where(eq(roles.name, 'Super Admin')).limit(1).then((res: any[]) => res[0]);
  const allPermissions = await db.select().from(permissions);

  if (superAdminRole && allPermissions.length > 0) {
    for (const perm of allPermissions) {
      const existing = await db.select().from(rolePermissions)
        .where(and(
          eq(rolePermissions.roleId, superAdminRole.id),
          eq(rolePermissions.permissionId, perm.id)
        ))
        .limit(1).then((res: any[]) => res[0]);

      if (!existing) {
        await db.insert(rolePermissions).values({
          roleId: superAdminRole.id,
          permissionId: perm.id,
        });
      }
    }
    console.log('✅ Linked all permissions to Super Admin role');
  }
};

/**
 * Seed Users
 */
export const seedUsers = async () => {
  console.log('🌱 Seeding users...');

  const superAdminRole = await db.select().from(roles).where(eq(roles.name, 'Super Admin')).limit(1).then((res: any[]) => res[0]);
  const memberRole = await db.select().from(roles).where(eq(roles.name, 'Member')).limit(1).then((res: any[]) => res[0]);

  const userList = [
    {
      name: 'Super Admin',
      email: 'admin@admin.com',
      password: DEV_TEMP_PASSWORD,
      roleId: superAdminRole?.id,
    },
    {
      name: 'John Doe',
      email: 'user@user.com',
      password: DEV_TEMP_PASSWORD,
      roleId: memberRole?.id,
    }
  ];

  for (const userData of userList) {
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1).then((res: any[]) => res[0]);

    if (!existingUser) {
      const hashedPassword = await gethashedpassword(userData.password);

      await db.insert(users).values({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        roleId: userData.roleId,
      });

      console.log(`✅ Created user: ${userData.email}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.email}`);
    }
  }
};

/**
 * Main Seeder Function
 */
export const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');

    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();
    await seedUsers();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Execute if run directly
seedDatabase();