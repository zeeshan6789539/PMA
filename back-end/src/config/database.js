const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('../database/schema');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Test database connection
async function testConnection() {
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

module.exports = { db, testConnection }; 