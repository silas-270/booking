import 'dotenv/config';
import express from 'express';
import puppeteer from 'puppeteer-core';
import helmet from 'helmet';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Für Railway nötig
  },
});

const createTableIfNotExists = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scraped_data (
      id SERIAL PRIMARY KEY,
      name TEXT,
      location TEXT,
      price INTEGER,
      rating REAL,
      images JSONB,
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

createTableIfNotExists().catch(console.error);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Sanitize URL input
const isValidBookingUrl = (url) => {
  try {
    const u = new URL(url);
    return u.hostname.endsWith('booking.com');
  } catch {
    return false;
  }
};

// Format data (unverändert)
const formatData = (data) => {
  const formatLocation = (location) => {
    if (!location) return null;
    const parts = location.split(',');
    if (parts.length < 2) return location.trim();
    const cityPart = parts[1].replace(/\d+/g, '').trim();
    const countryRaw = parts[2] || '';
    const countryMatch = countryRaw.trim().match(/^[A-Za-zÄÖÜäöüß]+/);
    const country = countryMatch ? countryMatch[0] : '';
    let combined = `${cityPart}, ${country}`;
    const cutIndex = combined.search(/(?<=[a-zäöüß])(?=[A-ZÄÖÜ])/);
    if (cutIndex !== -1) combined = combined.substring(0, cutIndex).trim();
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
    // Browserless-Verbindung
    const token = "2SclztNmn8H0MGYe1da02f8057fd6d214c5c2e807a0518de9"; //process.env.BROWSERLESS_TOKEN;
    if (!token) throw new Error('Missing BROWSERLESS_TOKEN');

    const region = 'production-ams.browserless.io'; // oder 'production-lon' etc.
    const wsEndpoint = `wss://${region}/?token=${token}`;

    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      ignoreHTTPSErrors: true,
      timeout: 60000,
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForSelector(
      '[data-capla-component-boundary*="PropertyHeaderName"] h2.pp-header__title',
      { timeout: 20000 }
    );

    const data = await page.evaluate(() => {
      const getName = () => {
        const w = document.querySelector('[data-capla-component-boundary*="PropertyHeaderName"]');
        const t = w?.querySelector('h2.pp-header__title');
        return t?.textContent.trim() || null;
      };
      const getLocation = () => {
        const c = document.querySelector('[data-testid="PropertyHeaderAddressDesktop-wrapper"]');
        const btn = c?.querySelector('button');
        const div = btn?.querySelector('div');
        return div?.textContent.trim() || null;
      };
      const getPrice = () => {
        const el = document.querySelector('.bui-price-display__value .prco-valign-middle-helper');
        return el?.textContent.trim() || null;
      };
      const getRating = () => {
        const c = document.querySelector('[data-testid="review-score-component"]');
        const r = c?.querySelector('div[aria-hidden="true"]');
        return r?.textContent.trim() || null;
      };
      const getImages = () => {
        const container = document.querySelector('#photo_wrapper');
        if (!container) return [];
        return Array.from(container.querySelectorAll('img'))
          .slice(0, 5)
          .map(img => ({ src: img.src, alt: img.alt }));
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

    try {
      await pool.query(
        `INSERT INTO scraped_data (name, location, price, rating, images, url) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          formatted.name,
          formatted.location,
          formatted.price,
          formatted.rating,
          JSON.stringify(formatted.images),
          url
        ]
      );
    } catch (dbError) {
      console.error('Database insert failed:', dbError);
    }
    
    res.json({ ...formatted, url });
  } catch (error) {
    console.error('Scraping failed:', error);
    res.status(500).json({ error: 'Failed to scrape data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
