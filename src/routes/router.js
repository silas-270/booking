import { Router } from 'express';
const router = Router();

// Subrouter importieren
import workspaceRouter from './workspaceRouter.js';
import cardRouter from './cardRouter.js';
import voteRouter from './voteRouter.js';
import imageRouter from './imageRouter.js';

// Subrouter unter den gewünschten Pfaden einhängen
router.use('/workspaces', workspaceRouter); // Handles: /users/:userId/workspaces...
router.use('/workspaces/:workspaceId/cards', cardRouter); // Handles all card routes under /users/:userId
router.use('/vote', voteRouter); // Handles votes
router.use('/images', imageRouter);

export default router;