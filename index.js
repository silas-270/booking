// scraper.js
const axios = require('axios');

const BROWSERLESS_API_KEY = 'YOUR_BROWSERLESS_API_KEY'; // Ersetze dies mit deinem echten API-Schlüssel
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
