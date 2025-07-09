import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Tabellen-Erstellung
const createTablesIfNotExist = async () => {
  // PostgreSQL Extension aktivieren (nur einmal nötig)
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Users (falls noch nicht vorhanden)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Workspaces mit UUIDs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // WorkspaceUser (Join-Tabelle)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspace_users (
      workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'member',
      PRIMARY KEY (workspace_id, user_id)
    );
  `);

  // Cards (cards), mit workspace_id & created_by
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      location TEXT,
      price INTEGER,
      rating REAL,
      images JSONB,
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL
    );
  `);
};

export {
  pool,
  createTablesIfNotExist,
};
