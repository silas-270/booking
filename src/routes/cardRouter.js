import { Router } from 'express';
import { pool } from '../db/db.js';
import { scrapeBookingData } from '../services/scraper.js';
import validateToken from '../services/validateToken.js';
const router = Router({ mergeParams: true });

// GET all cards in a workspace
router.get('/', async (req, res) => {
    const user = await validateToken(req.headers['authorization']);
    const userId = user.id
    const { workspaceId } = req.params;

    if (!userId) { return res.status(401).json({ error: 'Nicht authentifiziert' }); }

    try {
        const access = await checkWorkspaceAccess(userId, workspaceId);
        if (!access) return res.status(403).json({ error: 'Access denied' });

        const result = await pool.query(`
            SELECT * FROM cards WHERE workspace_id = $1 ORDER BY created_at DESC`,
            [workspaceId]
        );

        const cardsWithVotes = await Promise.all(
            result.rows.map(async (card) => {
                const { voteCount, voteState } = await getVoteData(card.id, userId);
                return {
                    ...card,
                    voteCount,
                    voteState
                };
            })
        );
        res.status(200).json(cardsWithVotes);
    } catch (err) {
        console.error('Failed to fetch cards:', err)
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// Create a new Card in a Workspace
router.post('/', async (req, res) => {
    const user = await validateToken(req.headers['authorization']);
    const userId = user.id
    const { workspaceId } = req.params;
    const { mode, ...data } = req.body;

    if (!userId) { return res.status(401).json({ error: 'Nicht authentifiziert' }); }
    if (!mode) { return res.status(400).json({ error: 'mode is required' }) }

    const access = await checkWorkspaceAccess(userId, workspaceId);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    try {
        let cardData;
        switch (mode) {
            case 'raw':
                cardData = { ...data, url: data.url, workspaceId, userId };
                break;
            case 'scraperBooking':
                const scrapedData = await scrapeBookingData(data.url);
                if (!scrapedData) return res.status(400).json({ error: 'Invalid or failed scraping from Booking.com' });
                cardData = { ...scrapedData, url: data.url, workspaceId, userId };
                break;
            default:
                return res.status(400).json({ error: `Unsupported mode: ${mode}` });
        }
        await saveCard(cardData);
        return res.status(201).json(cardData);
    } catch (err) {
        console.error('Failed to create card:', err)
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// DELETE a specific card by ID (global)
router.delete('/:cardId', async (req, res) => {
    const user = await validateToken(req.headers['authorization']);
    const userId = user.id
    const { cardId } = req.params;

    console.log(userId, cardId);

    if (!userId) { return res.status(401).json({ error: 'Nicht authentifiziert' }); }

    try {
        // 1. Card-Daten abrufen
        const cardResult = await pool.query(`
            SELECT created_by, workspace_id FROM cards WHERE id = $1
        `, [cardId]);

        if (cardResult.rowCount === 0) {
            return res.status(404).json({ error: 'Card nicht gefunden' });
        }

        const { created_by, workspace_id } = cardResult.rows[0];

        // 2. Bedingung 1: Ist der User der Ersteller?
        const isCreator = userId === created_by;

        // 3. Bedingung 2: Ist der User Owner im Workspace?
        const workspaceRoleResult = await pool.query(`
            SELECT role FROM workspace_users 
            WHERE user_id = $1 AND workspace_id = $2
        `, [userId, workspace_id]);

        const isOwner = workspaceRoleResult.rows[0]?.role === 'owner';

        // 4. Prüfen, ob eine der Bedingungen zutrifft
        if (!isCreator && !isOwner) {
            return res.status(403).json({ error: 'Nicht autorisiert, diese Karte zu löschen' });
        }

        // 5. Karte löschen
        const deleteResult = await pool.query(`
            DELETE FROM cards WHERE id = $1 RETURNING *
        `, [cardId]);

        res.status(200).json(deleteResult.rows[0]);

    } catch (err) {
        console.error('Failed to delete card:', err);
        res.status(500).json({ error: 'Failed to delete card' });
    }
});

export default router;

async function checkWorkspaceAccess(userId, workspaceId) {
    const access = await pool.query(`
        SELECT * FROM workspace_users WHERE workspace_id = $1 AND user_id = $2`,
        [workspaceId, userId]
    );
    return (access.rowCount !== 0);
}

async function getVoteData(cardId, userId) {
    // Alle Votes ohne den eigenen
    const voteCountResult = await pool.query(
        `SELECT COALESCE(SUM(vote), 0) AS count FROM votes WHERE card_id = $1 AND user_id != $2`,
        [cardId, userId]
    );
    const voteCount = voteCountResult.rows[0].count;

    // Eigener Vote
    const userVoteResult = await pool.query(
        `SELECT vote FROM votes WHERE card_id = $1 AND user_id = $2`,
        [cardId, userId]
    );
    const voteState = userVoteResult.rowCount > 0 ? userVoteResult.rows[0].vote : 0;

    return { voteCount: parseInt(voteCount), voteState };
}

async function saveCard(data) {
    await pool.query(`
        INSERT INTO cards (name, location, price, rating, images, url, workspace_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [data.name, data.location, data.price, data.rating, JSON.stringify(data.images), data.url, data.workspaceId, data.userId]
    );
}
