import 'dotenv/config';
import { db } from '../../config/database.ts';
import { users } from '../schema/index.ts';
import { eq } from 'drizzle-orm';
import { gethashedpassword } from '../../utils/helper.ts';

/**
 * Seed Users
 */
export const seedUsers = async () => {
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
      const hashedPassword = await gethashedpassword(userData.password);

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
export const seedDatabase = async () => {
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

// Execute if run directly
seedDatabase();