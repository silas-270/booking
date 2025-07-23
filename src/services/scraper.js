import puppeteer from 'puppeteer-core';

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;
const BROWSERLESS_REGION = 'production-ams.browserless.io'

/**
 * Scrapes hotel data from a Booking.com URL.
 *
 * @param {string} url – die Booking.com-URL, die gescraped werden soll
 * @returns {Promise<object>} – das formatierte Ergebnisobjekt inklusive url
 * @throws {Error} – bei ungültiger URL oder Scraping-Fehlern
 */
export async function scrapeBookingData(url) {
    if (!url || !isValidBookingUrl(url)) {
        console.warn('Invalid or missing Booking.com URL');
        return;
    }

    if (!BROWSERLESS_TOKEN) {
        console.warn('Missing BROWSERLESS_TOKEN');
        return;
    }

    const wsEndpoint = `wss://${BROWSERLESS_REGION}/?token=${BROWSERLESS_TOKEN}`;

    // Verbindung zum remote Browser
    const browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
        ignoreHTTPSErrors: true,
        timeout: 60_000,
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/114.0.0.0 Safari/537.36'
        );

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30_000
        });
        await page.waitForSelector(
            '[data-capla-component-boundary*="PropertyHeaderName"] h2.pp-header__title',
            { timeout: 20_000 }
        );

        // Daten aus der Seite extrahieren
        const rawData = await page.evaluate(() => {
            const getName = () => {
                const el = document.querySelector('[data-capla-component-boundary*="PropertyHeaderName"] h2.pp-header__title');
                return el?.textContent.trim() ?? null;
            };
            const getLocation = () => {
                const btn = document.querySelector('[data-testid="PropertyHeaderAddressDesktop-wrapper"] button');
                return btn?.innerText.trim() ?? null;
            };
            const getPrice = () => {
                const el = document.querySelector('.bui-price-display__value .prco-valign-middle-helper');
                return el?.textContent.trim() ?? null;
            };
            const getRating = () => {
                const el = document.querySelector('[data-testid="review-score-component"] div[aria-hidden="true"]');
                return el?.textContent.trim() ?? null;
            };
            const getImages = () => {
                const imgs = Array.from(document.querySelectorAll('#photo_wrapper img')).slice(0, 5);
                return imgs.map(img => ({ src: img.src, alt: img.alt }));
            };

            return {
                name: getName(),
                location: getLocation(),
                price: getPrice(),
                rating: getRating(),
                images: getImages(),
            };
        });

        // Browser schließen
        await browser.close();

        return formatData(rawData);
    } catch (err) {
        await browser.close();
        throw new Error(`Scraping failed: ${err.message}`);
    }
}

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