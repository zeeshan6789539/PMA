import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../database/schema/index.js';

import { DATABASE_URL } from '../utils/constant.js';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Test database connection
export async function testConnection() {
  await pool.query('SELECT 1')
    .then(() => console.log('✅ Database connected successfully'))
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await pool.end();
});