import { Router } from 'express';
import { pool } from '../db/db.js';
import validateToken from '../services/validateToken.js';
const router = Router();

router.post('/', async (req, res) => {
  const user = await validateToken(req.headers['authorization']);
  const userId = user.id
  const { cardId, vote } = req.body;

  if (![1, 0, -1].includes(vote)) {
    return res.status(400).json({ error: 'Invalid vote value' });
  }

  try {
    // Prüfen, ob bereits ein Vote existiert
    const existingVote = await pool.query(
      `SELECT vote FROM votes WHERE user_id = $1 AND card_id = $2`,
      [userId, cardId]
    );

    if (existingVote.rowCount > 0) {
      if (vote === 0) {
        // Wenn 0, dann Vote löschen (neutral)
        await pool.query(
          `DELETE FROM votes WHERE user_id = $1 AND card_id = $2`,
          [userId, cardId]
        );
        return res.json({ message: 'Vote removed' });
      } else {
        // Sonst aktualisieren
        await pool.query(
          `UPDATE votes SET vote = $1 WHERE user_id = $2 AND card_id = $3`,
          [vote, userId, cardId]
        );
        return res.json({ message: 'Vote updated' });
      }
    } else {
      if (vote === 0) {
        // Kein vorhandener Vote + neutral → nichts tun
        return res.json({ message: 'No existing vote to remove' });
      } else {
        // Neuer Vote
        await pool.query(
          `INSERT INTO votes (user_id, card_id, vote) VALUES ($1, $2, $3)`,
          [userId, cardId, vote]
        );
        return res.json({ message: 'Vote created' });
      }
    }
  } catch (err) {
    console.error('Error processing vote:', err);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

export default router;