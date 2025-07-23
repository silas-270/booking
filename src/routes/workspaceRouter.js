import { Router } from 'express';
import { pool } from '../db/db.js';
import validateToken from '../services/validateToken.js';
const router = Router({ mergeParams: true });

// GET all workspaces for a user
router.get('/', async (req, res) => {
    const user = await validateToken(req.headers['authorization']);
    const userId = user.id

    if (!userId) { return res.status(401).json({ error: 'Nicht authentifiziert' }); }

    try {
        const result = await pool.query(`
            SELECT w.*
            FROM workspaces w
            JOIN workspace_users wu ON w.id = wu.workspace_id
            WHERE wu.user_id = $1`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Failed to fetch workspaces:', err)
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
});

// POST create new workspace for a user
router.post('/', async (req, res) => {
    const user = await validateToken(req.headers['authorization']);
    const userId = user.id

    const { name, image } = req.body;

    if (!userId) { return res.status(401).json({ error: 'Nicht authentifiziert' }); }

    try {
        const result = await pool.query(`
            INSERT INTO workspaces (name, image, owner_id) VALUES ($1, $2, $3) RETURNING *`,
            [name, image, userId]
        );
        const workspace = result.rows[0];
        await pool.query(`
            INSERT INTO workspace_users (workspace_id, user_id, role) VALUES ($1, $2, 'owner')`,
            [workspace.id, userId]
        );
        res.status(201).json(workspace);
    } catch (err) {
        console.error('Failed to create workspace:', err)
        res.status(500).json({ error: 'Failed to create workspace' });
    }
});

// DELETE a specific workspace
router.delete('/:workspaceId', async (req, res) => {
    const user = await validateToken(req.headers['authorization']);
    const userId = user.id
    const { workspaceId } = req.params;

    if (!userId) { return res.status(401).json({ error: 'Nicht authentifiziert' }); }

    try {
        // Prüfen, ob der Nutzer Owner des Workspace ist
        const checkOwner = await pool.query(
            `SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2`,
            [workspaceId, userId]
        );

        if (checkOwner.rowCount === 0) {
            return res.status(403).json({ error: 'Nur der Owner darf den Workspace löschen' });
        }

        // Wenn Owner, dann löschen
        const result = await pool.query(
            `DELETE FROM workspaces WHERE id = $1 RETURNING *`,
            [workspaceId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Workspace nicht gefunden' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Failed to delete workspace:', err);
        res.status(500).json({ error: 'Fehler beim Löschen des Workspaces' });
    }
});

export default router;