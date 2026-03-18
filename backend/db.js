const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')
    ? { rejectUnauthorized: false }
    : false,
  // Fallback to individual vars for local dev
  host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
  port: process.env.DATABASE_URL ? undefined : (process.env.DB_PORT || 5432),
  database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'task_tracker'),
  user: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'postgres'),
  password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || ''),
});

pool.on('error', (err) => {
  console.error('Unexpected database client error:', err);
  process.exit(-1);
});

async function initDB() {
  const sql = `
    CREATE TABLE IF NOT EXISTS tasks (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(255)  NOT NULL,
      description TEXT          NOT NULL DEFAULT '',
      status      VARCHAR(20)   NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo', 'in-progress', 'done')),
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );
  `;
  try {
    await pool.query(sql);
    console.log('✓ Database ready');
  } catch (err) {
    console.error('✗ Database init failed:', err.message);
    throw err;
  }
}

module.exports = { pool, initDB };
