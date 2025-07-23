import { Router } from 'express';
const router = Router();

router.get('/', async (req, res) => {
    const query = req.query.q;
    const index = Number(req.query.index);

    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ error: 'Missing or invalid query parameter "q"' });
    }
    if (!Number.isInteger(index) || index < 1) {
        return res.status(400).json({ error: 'Invalid index parameter' });
    }

    try {
        const perPage = 10;
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${index}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
        );

        if (response.status === 403 || response.status === 429) {
            return res.status(503).json({ error: 'Unsplash API rate limit exceeded' });
        }
        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data.results)) {
            return res.status(502).json({ error: 'Unexpected response from Unsplash API' });
        }

        const CROP_WIDTH = 1200;
        const CROP_HEIGHT = 900;
        const images = data.results.map((item) => {
            const url = new URL(item.urls.raw);
            url.searchParams.set('fit', 'crop');
            url.searchParams.set('crop', 'entropy');
            url.searchParams.set('w', CROP_WIDTH);
            url.searchParams.set('h', CROP_HEIGHT);

            return {
                alt: item.alt_description || 'Unsplash Image',
                src: url.toString(),
            };
        });

        res.json(images);
    } catch (error) {
        console.error('Error fetching from Unsplash:', {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;