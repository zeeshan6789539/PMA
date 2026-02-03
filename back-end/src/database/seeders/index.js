const bcrypt = require('bcryptjs');
const { prisma } = require('../../config/database');

/**
 * Ensure base roles exist and return a map by name
 */
const ensureRoles = async () => {
  console.log('🌱 Seeding roles...');

  const baseRoles = ['SUPERADMIN', 'ADMIN', 'USER'];
  const roleMap = {};
  for (const name of baseRoles) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    roleMap[name] = role.id;
  }
  return roleMap;
};

/**
 * Seed Users
 */
const seedUsers = async () => {
  console.log('🌱 Seeding users...');

  const roleMap = await ensureRoles();

  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'password123',
      roleName: 'SUPERADMIN'
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      roleName: 'ADMIN'
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      roleName: 'USER'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      roleName: 'USER'
    }
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          roleId: roleMap[userData.roleName]
        }
      });
      
      console.log(`✅ Created user: ${userData.email} (${userData.roleName})`);
    } else {
      console.log(`⏭️  User already exists: ${userData.email}`);
    }
  }
};

/**
 * Seed Permissions
 */
const seedPermissions = async () => {
  console.log('🌱 Seeding permissions...');

  const permissions = [
    // User management permissions
    {
      name: 'user.create',
      description: 'Create new users',
      resource: 'user',
      action: 'create'
    },
    {
      name: 'user.read',
      description: 'Read user information',
      resource: 'user',
      action: 'read'
    },
    {
      name: 'user.update',
      description: 'Update user information',
      resource: 'user',
      action: 'update'
    },
    {
      name: 'user.delete',
      description: 'Delete users',
      resource: 'user',
      action: 'delete'
    },
    // Permission management
    {
      name: 'permission.create',
      description: 'Create new permissions',
      resource: 'permission',
      action: 'create'
    },
    {
      name: 'permission.read',
      description: 'Read permission information',
      resource: 'permission',
      action: 'read'
    },
    {
      name: 'permission.grant',
      description: 'Grant permissions to users',
      resource: 'permission',
      action: 'grant'
    },
    {
      name: 'permission.revoke',
      description: 'Revoke permissions from users',
      resource: 'permission',
      action: 'revoke'
    }
  ];

  for (const permissionData of permissions) {
    const existingPermission = await prisma.permission.findUnique({
      where: { name: permissionData.name }
    });

    if (!existingPermission) {
      await prisma.permission.create({
        data: permissionData
      });
      
      console.log(`✅ Created permission: ${permissionData.name}`);
    } else {
      console.log(`⏭️  Permission already exists: ${permissionData.name}`);
    }
  }
};

/**
 * Grant Permissions to Roles
 */
const seedRolePermissions = async () => {
  console.log('🌱 Assigning permissions to roles...');

  const roles = await ensureRoles();

  // All permissions for SUPERADMIN
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    const existing = await prisma.rolePermission.findFirst({ where: { roleId: roles['SUPERADMIN'], permissionId: permission.id } });
    if (!existing) {
      await prisma.rolePermission.create({ data: { roleId: roles['SUPERADMIN'], permissionId: permission.id } });
    }
  }

  // Subset for ADMIN
  const adminPermissionNames = ['user.read', 'user.update', 'permission.read'];
  for (const name of adminPermissionNames) {
    const permission = await prisma.permission.findUnique({ where: { name } });
    if (permission) {
      const existing = await prisma.rolePermission.findFirst({ where: { roleId: roles['ADMIN'], permissionId: permission.id } });
      if (!existing) {
        await prisma.rolePermission.create({ data: { roleId: roles['ADMIN'], permissionId: permission.id } });
      }
    }
  }

  // Minimal for USER
  const userPermissionNames = ['user.read'];
  for (const name of userPermissionNames) {
    const permission = await prisma.permission.findUnique({ where: { name } });
    if (permission) {
      const existing = await prisma.rolePermission.findFirst({ where: { roleId: roles['USER'], permissionId: permission.id } });
      if (!existing) {
        await prisma.rolePermission.create({ data: { roleId: roles['USER'], permissionId: permission.id } });
      }
    }
  }

  console.log('✅ Role permissions assigned successfully');
};

/**
 * Main Seeder Function
 */
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');

    // Seed users first
    await seedUsers();

    // Seed permissions
    await seedPermissions();

    // Assign permissions to roles
    await seedRolePermissions();

    console.log('✅ Database seeding completed successfully!');
    
    // Display seeded data summary
    const userCount = await prisma.user.count();
    const permissionCount = await prisma.permission.count();
    const rolePermissionCount = await prisma.rolePermission.count();
    
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Permissions: ${permissionCount}`);
    console.log(`   - Role Permissions: ${rolePermissionCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Clear Database Function
 */
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    // Delete in reverse order due to foreign key constraints
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'clear') {
    clearDatabase();
  } else {
    seedDatabase();
  }
}

module.exports = {
  seedDatabase,
  clearDatabase,
  seedUsers,
  seedPermissions,
  seedRolePermissions
}; 