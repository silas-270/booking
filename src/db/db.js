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

  // Workspaces mit UUIDs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      image JSONB,
      owner_id UUID,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // WorkspaceUser (Join-Tabelle)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspace_users (
      workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id UUID,
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
      created_by UUID
    );
  `),

  // Votes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
      user_id UUID,
      card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
      vote SMALLINT CHECK (vote IN (-1, 0, 1)),
      PRIMARY KEY (user_id, card_id)
    );
  `);
};

export {
  pool,
  createTablesIfNotExist,
};
