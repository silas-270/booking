// scraper.js
const axios = require('axios');

const BROWSERLESS_API_KEY = '2SclztNmn8H0MGYe1da02f8057fd6d214c5c2e807a0518de9';
const TARGET_URL = 'https://www.booking.com/hotel/it/villaggio-i-sorbizzi-resort.de.html?aid=304142&label=gen173nr-1FCAEoggI46AdIM1gEaDuIAQGYAQe4ARfIAQ_YAQHoAQH4AQyIAgGoAgO4Atm8n8MGwAIB0gIkZWQ0ODM3NTYtZTM3ZS00NDlmLTg0ZjctMGE2MDljZDg4OWUy2AIG4AIB&sid=f382a5831818c1661cd5dee1516313a6&all_sr_blocks=8992319_89994196_4_2_0_244229%2C8992319_89994196_2_2_0_244229&checkin=2025-09-11&checkout=2025-09-19&dest_id=-128916&dest_type=city&dist=0&group_adults=6&group_children=0&hapos=6&highlighted_blocks=8992319_89994196_4_2_0_244229%2C8992319_89994196_2_2_0_244229&hpos=6&matching_block_id=8992319_89994196_4_2_0_244229&nflt=sth%3D19&no_rooms=1&req_adults=6&req_children=0&room1=A%2CA%2CA%2CA%2CA%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=8992319_89994196_4_2_0_244229_246400%2C8992319_89994196_2_2_0_244229_196000&srepoch=1751710337&srpvid=3a596719872b01dd&type=total&ucfs=1&';

const code = `
  export default async function ({ page }) {
    // User-Agent setzen (ähnlich wie dein Puppeteer-Code)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    // Seite laden und warten, bis DOM geladen ist
    await page.goto('${TARGET_URL}', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Warten auf ein spezifisches wichtiges Element, wie in deinem Puppeteer-Code
    await page.waitForSelector('[data-capla-component-boundary*="PropertyHeaderName"] h2.pp-header__title', { timeout: 20000 });

    // Deine Scraper-Funktionen bleiben gleich
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
      images: getImages()
    };
  }
`;

async function scrape() {
  try {
    const response = await axios.post(
      `https://production-sfo.browserless.io/function?token=${BROWSERLESS_API_KEY}`,
      { code },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.dir(response.data, { depth: null });
  } catch (error) {
    console.error('Fehler beim Scrapen:', error.response?.data || error.message);
  }
}

scrape();