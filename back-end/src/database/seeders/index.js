require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('../../config/database');
const { users } = require('../schema');
const { eq } = require('drizzle-orm');

/**
 * Seed Users
 */
const seedUsers = async () => {
  console.log('🌱 Seeding users...');

  const userList = [
    {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'password123',
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    }
  ];

  for (const userData of userList) {
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).then(res => res[0]);

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await db.insert(users).values({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
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
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    await seedUsers();
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};


// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  seedUsers
};