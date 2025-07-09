import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { pool, createTablesIfNotExist } from './db/db.js';

async function initializeDatabase() {
  await createTablesIfNotExist();
  console.log('Datenbanktabellen initialisiert.');
}
initializeDatabase().catch(err => {
  console.error('DB-Init-Fehler:', err);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// API-Routen
app.post('/workspaces', async (req, res) => {
  const { name, ownerId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *`,
      [name, ownerId]
    );

    const workspace = result.rows[0];

    // Owner automatisch zur workspace_users hinzufügen
    await pool.query(
      `INSERT INTO workspace_users (workspace_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [workspace.id, ownerId]
    );

    res.status(201).json(workspace);
  } catch (err) {
    console.error('Error creating workspace:', err);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

app.post('/workspaces/:workspaceId/cards', async (req, res) => {
  const { workspaceId } = req.params;
  const {
    name,
    location,
    price,
    rating,
    images,
    url,
    createdBy
  } = req.body;

  try {
    // Zugriff prüfen
    const access = await pool.query(
      `SELECT * FROM workspace_users WHERE workspace_id = $1 AND user_id = $2`,
      [workspaceId, createdBy]
    );

    if (access.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO cards (name, location, price, rating, images, url, workspace_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, location, price, rating, images, url, workspaceId, createdBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating card:', err);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

app.get('/users/:userId/workspaces', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT w.*
       FROM workspaces w
       JOIN workspace_users wu ON w.id = wu.workspace_id
       WHERE wu.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching workspaces:', err);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

app.get('/workspaces/:workspaceId/cards', async (req, res) => {
  const { workspaceId } = req.params;
  const { userId } = req.query;

  try {
    // Zugriff prüfen
    const access = await pool.query(
      `SELECT * FROM workspace_users WHERE workspace_id = $1 AND user_id = $2`,
      [workspaceId, userId]
    );

    if (access.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT * FROM cards WHERE workspace_id = $1 ORDER BY created_at DESC`,
      [workspaceId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cards:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});


app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
