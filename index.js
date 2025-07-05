// scraper.js
const axios = require('axios');

const BROWSERLESS_API_KEY = '2SclztNmn8H0MGYe1da02f8057fd6d214c5c2e807a0518de9'; // Ersetze dies mit deinem echten API-Schlüssel
const TARGET_URL = 'https://example.com';

async function scrapePage(url) {
  try {
    const response = await axios.post(
      `https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}`,
      {
        url: url,
        options: {
          waitUntil: 'networkidle0',
        },
      }
    );

    console.log('Seiteninhalt:', response.data);
  } catch (error) {
    console.error('Fehler beim Scrapen:', error.response ? error.response.data : error.message);
  }
}

scrapePage(TARGET_URL);
