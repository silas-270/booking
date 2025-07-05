import express from 'express';
import puppeteer from 'puppeteer-core';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteerExtra from 'puppeteer-extra';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY; // set your API key in env
const BROWSERLESS_WS = `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`;

puppeteerExtra.use(StealthPlugin());

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

// Format functions same as before
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
  const formatPrice = (price) => price ? parseInt(price.replace(/[^\d]/g, ''), 10) : null;
  const formatRating = (rating) => rating ? parseFloat(rating.replace(',', '.')) : null;

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

  let browser;
  try {
    console.log('Connecting to Browserless...');
    browser = await puppeteerExtra.connect({ browserWSEndpoint: BROWSERLESS_WS });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    console.log('Navigating to URL:', url);
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page response status:', response?.status());

    if (response?.status() === 403) {
      throw new Error('Access denied (403) – site might be blocking automated traffic');
    }

    await page.waitForSelector('[data-capla-component-boundary*="PropertyHeaderName"] h2.pp-header__title', { timeout: 20000 });

    const data = await page.evaluate(() => {
      const getName = () => {
        const wrapper = document.querySelector('[data-capla-component-boundary*="PropertyHeaderName"]');
        const title = wrapper?.querySelector('h2.pp-header__title');
        return title?.textContent.trim() || null;
      };
      const getLocation = () => {
        const container = document.querySelector('[data-testid="PropertyHeaderAddressDesktop-wrapper"]');
        return (
          container?.querySelector('button')?.querySelector('div')?.textContent.trim() || null
        );
      };
      const getPrice = () =>
        document.querySelector('.bui-price-display__value .prco-valign-middle-helper')?.textContent.trim() || null;
      const getRating = () =>
        document.querySelector('[data-testid="review-score-component"] div[aria-hidden="true"]')?.textContent.trim() || null;
      const getImages = () => {
        const imgs = document.querySelectorAll('#photo_wrapper img');
        return Array.from(imgs).slice(0, 5).map((img) => ({
          src: img.src,
          alt: img.alt,
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

    await page.close();
    await browser.disconnect();

    const formatted = formatData(data);
    res.json({ ...formatted, url });
  } catch (error) {
    console.error('Scraping failed:', error.message);
    if (browser) await browser.disconnect();
    res.status(500).json({ error: 'Failed to scrape data.', details: error.message });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
