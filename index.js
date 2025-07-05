import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
//const insertJson = require('./insertJson');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
puppeteer.use(StealthPlugin());

// Rate limiting
/*const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
});
app.use(limiter);*/

// Sanitize URL input
const isValidBookingUrl = (url) => {
    try {
        const u = new URL(url);
        return u.hostname.endsWith('booking.com');
    } catch {
        return false;
    }
};

// Format data
const formatData = (data) => {
    const formatLocation = (location) => {
        if (!location) return null;

        const parts = location.split(',');
        if (parts.length < 2) return location.trim();

        // City-Part: nach erstem Komma, Ziffern entfernen
        const cityPart = parts[1].replace(/\d+/g, '').trim();

        // Country-Teil: nach zweitem Komma nur das erste reine Wort übernehmen
        const countryRaw = parts[2] || '';
        const countryMatch = countryRaw.trim().match(/^[A-Za-zÄÖÜäöüß]+/);
        const country = countryMatch ? countryMatch[0] : '';

        // Zusammensetzen
        let combined = `${cityPart}, ${country}`;

        // Abschneiden an der Stelle, wo ein Kleinbuchstabe direkt auf einen Großbuchstaben folgt (z.B. "nH")
        const cutIndex = combined.search(/(?<=[a-zäöüß])(?=[A-ZÄÖÜ])/);
        if (cutIndex !== -1) {
            combined = combined.substring(0, cutIndex).trim();
        }

        // Eventuell hängende Kommata entfernen
        return combined.replace(/,\s*$/, '');
    };

    const formatPrice = (price) => {
        if (!price) return null;
        return parseInt(price.replace(/[^\d]/g, ''), 10);
    };

    const formatRating = (rating) => {
        if (!rating) return null;
        return parseFloat(rating.replace(',', '.'));
    };

    return {
        name: data.name,
        location: formatLocation(data.location),
        price: formatPrice(data.price),
        rating: formatRating(data.rating),
        images: data.images,
    };
};

app.post('/api/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url || !isValidBookingUrl(url)) {
        return res.status(400).json({ error: 'Invalid or missing Booking.com URL' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox'
            ]
        });

        const page = await browser.newPage();

        // Set realistic user-agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('[data-capla-component-boundary*="PropertyHeaderName"] h2.pp-header__title', { timeout: 20000 });

        const data = await page.evaluate(() => {
            const getName = () => {
                const wrapper = document.querySelector('[data-capla-component-boundary*="PropertyHeaderName"]');
                if (!wrapper) return null;
                const title = wrapper.querySelector('h2.pp-header__title');
                return title ? title.textContent.trim() : null;
            };

            const getLocation = () => {
                const container = document.querySelector('[data-testid="PropertyHeaderAddressDesktop-wrapper"]');
                if (!container) return null;
                const button = container.querySelector('button');
                if (!button) return null;
                const addressDiv = button.querySelector('div');
                return addressDiv ? addressDiv.textContent.trim() : null;
            };

            const getPrice = () => {
                const el = document.querySelector('.bui-price-display__value .prco-valign-middle-helper');
                return el ? el.textContent.trim() : null;
            };

            const getRating = () => {
                const container = document.querySelector('[data-testid="review-score-component"]');
                if (!container) return null;
                const ratingEl = container.querySelector('div[aria-hidden="true"]');
                return ratingEl ? ratingEl.textContent.trim() : null;
            };

            const getImages = () => {
                const container = document.querySelector('#photo_wrapper');
                if (!container) return [];

                const imgElements = container.querySelectorAll('img');
                return Array.from(imgElements)
                    .slice(0, 5)
                    .map(img => ({
                        src: img.src,
                        alt: img.alt
                    }));
            };

            return {
                name: getName(),
                location: getLocation(),
                price: getPrice(),
                rating: getRating(),
                images: getImages(),
            };
        });

        await browser.close();

        const formatted = formatData(data);
        res.json({ ...formatted, url });
    } catch (error) {
        console.error('Scraping failed:', error);
        res.status(500).json({ error: 'Failed to scrape data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});