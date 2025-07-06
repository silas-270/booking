/**
 * Klasse für eine einzelne Unterkunft
 */
const API_URL = "https://booking-production-3ae3.up.railway.app";

const SVG_UP = `
<svg fill="currentColor" width="16" height="16" viewBox="0 0 20 20"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M10 19c-.072 0-.145 0-.218-.006A4.1 4.1 0 0 1 6 14.816V11H2.862a1.751 1.751 0 0 1-1.234-2.993L9.41.28a.836.836 0 0 1 1.18 0l7.782 7.727A1.751 1.751 0 0 1 17.139 11H14v3.882a4.134 4.134 0 0 1-.854 2.592A3.99 3.99 0 0 1 10 19Z"/>
</svg>`;

const SVG_DOWN = `
<svg fill="currentColor" width="16" height="16" viewBox="0 0 20 20"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M10 1c.072 0 .145 0 .218.006A4.1 4.1 0 0 1 14 5.184V9h3.138a1.751 1.751 0 0 1 1.234 2.993L10.59 19.72a.836.836 0 0 1-1.18 0l-7.782-7.727A1.751 1.751 0 0 1 2.861 9H6V5.118a4.134 4.134 0 0 1 .854-2.592A3.99 3.99 0 0 1 10 1Z"/>
</svg>`;

// ——————————————————————————————
// Globale Fullscreen‑Modal‑Galerie
// ——————————————————————————————

let galleryModal, galleryImg, galleryPrev, galleryNext, galleryClose;
let galleryImages = [], galleryIdx = 0;

// Erzeugt das Modal einmalig
function initGalleryModal() {
    galleryModal = document.createElement('div');
    galleryModal.className = 'gallery-modal';
    galleryModal.innerHTML = `
    <div class="gallery-overlay"></div>
    <button class="gallery-close">x</button>
    <button class="gallery-prev"><</button>
    <img class="gallery-img" src="" alt="" />
    <button class="gallery-next">></button>
  `;
    document.body.appendChild(galleryModal);

    galleryImg = galleryModal.querySelector('.gallery-img');
    galleryPrev = galleryModal.querySelector('.gallery-prev');
    galleryNext = galleryModal.querySelector('.gallery-next');
    galleryClose = galleryModal.querySelector('.gallery-close');

    // Event‑Handler
    galleryClose.onclick = () => galleryModal.classList.remove('open');
    galleryPrev.onclick = () => showGalleryImage(galleryIdx - 1);
    galleryNext.onclick = () => showGalleryImage(galleryIdx + 1);
    galleryModal.querySelector('.gallery-overlay')
        .onclick = () => galleryModal.classList.remove('open');
}

// Zeigt das i‑te Bild aus images[]
function showGalleryImage(i) {
    if (i < 0) i = galleryImages.length - 1;
    if (i >= galleryImages.length) i = 0;
    galleryIdx = i;
    galleryImg.src = galleryImages[i].src;
    galleryImg.alt = galleryImages[i].alt || '';
}

// Öffnet die Galerie mit einem Image‑Array
function openGallery(images, startIdx = 0) {
    if (!galleryModal) initGalleryModal();
    galleryImages = images;
    showGalleryImage(startIdx);
    galleryModal.classList.add('open');
}

// ——————————————————————————————
// Ende Modal‑Code
// ——————————————————————————————


class Accommodation {
    constructor({ id, name, location, price, rating, images, url, votes = 0, voteState = 0 }) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.price = price;
        this.rating = rating;
        this.images = images;
        this.url = url;
        this.votes = votes;        // aktuelle Stimmezahl
        this.voteState = voteState; // 1 = up, -1 = down, 0 = neutral

        // ← NEU: Bilder vorladen, damit beim Switchen nicht geflackert wird
        if (Array.isArray(images)) {
            images.forEach(imgData => {
                const img = new Image();
                img.src = imgData.src;
            });
        }
    }

    /**
     * Baut das DOM-Element (Kachel) für diese Unterkunft
     */
    render() {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = this.id;

        // Swipe-Container für Bilder
        const swipeContainer = document.createElement('div');
        swipeContainer.classList.add('card__swipe');

        let idx = 0;

        // ← Neu: Bild‐Index‐Anzeige
        const counter = document.createElement('div');
        counter.classList.add('card__counter');
        swipeContainer.appendChild(counter);


        const imgBox = document.createElement('div');
        imgBox.classList.add('card__imgbox');
        // Funktion, die das gerade aktive Bild lädt
        const updateImage = () => {
            imgBox.innerHTML = '';
            const tmp = new Image();
            tmp.alt = this.images?.[idx]?.alt ?? '';
            tmp.onload = () => {
                imgBox.appendChild(tmp);

                // ← Neu: Counter updaten und zeigen
                const total = this.images?.length || 1;
                counter.textContent = `${idx + 1}/${total}`;
                counter.classList.add('visible');

                // nach 1,5 s einblenden, dann nach 0,5 s ausblenden
                clearTimeout(counter.hideTimeout);
                counter.hideTimeout = setTimeout(() => {
                    counter.classList.remove('visible');
                }, 1500);
            };
            tmp.src = this.images?.[idx]?.src ?? '';
        };

        updateImage();

        // Beim Klick in die Bild‑Box: Fullscreen‑Galerie öffnen
        imgBox.onclick = () => {
            openGallery(this.images || [], idx);
        };


        // Links/Rechts-Wechsel per Klick (Swipe via Touch evt. ergänzen)
        const prev = document.createElement('button');
        prev.classList.add('card__swipe-btn', 'prev');
        prev.textContent = '‹';
        prev.onclick = () => {
            if (!this.images?.length) return;
            idx = (idx - 1 + this.images.length) % this.images.length;
            updateImage();
        };

        const next = document.createElement('button');
        next.classList.add('card__swipe-btn', 'next');
        next.textContent = '›';
        next.onclick = () => {
            if (!this.images?.length) return;
            idx = (idx + 1) % this.images.length;
            updateImage();
        };

        swipeContainer.append(prev, imgBox, next);
        card.appendChild(swipeContainer);

        // Info-Section
        const info = document.createElement('div');
        info.classList.add('card__info');
        info.innerHTML = `
      <div class="card__row1">
        <h2><a href="${this.url}" target="_blank" rel="noopener">${this.name}</a></h2>
        <div class="price">€ ${this.price ?? '–'}</div>
      </div>
      <div class="card__row2">
        <div class="location">${this.location}</div>
        <div class="rating">⭐ ${this.rating?.toFixed(1) ?? '–'}</div>
      </div>
    `;
        card.appendChild(info);

        // ───── Vote‑Box ─────
        const voteBox = document.createElement('div');
        voteBox.className = 'vote-box';

        const upBtn = document.createElement('button');
        upBtn.className = 'vote-btn vote-up';
        upBtn.innerHTML = SVG_UP;

        const countEl = document.createElement('span');
        countEl.className = 'vote-count';
        countEl.textContent = this.votes;

        const divider = document.createElement('span');
        divider.className = 'vote-divider';

        const downBtn = document.createElement('button');
        downBtn.className = 'vote-btn vote-down';
        downBtn.innerHTML = SVG_DOWN;

        voteBox.append(upBtn, countEl, divider, downBtn);
        card.appendChild(voteBox);

        // ───── Logik & State‑Machine ─────
        const updateVoteUI = () => {
            countEl.textContent = this.votes;
            upBtn.classList.toggle('active', this.voteState === 1);
            downBtn.classList.toggle('active', this.voteState === -1);
        };
        updateVoteUI();

        upBtn.addEventListener('click', () => {
            if (this.voteState === 1) {          // Up war aktiv → neutral
                this.voteState = 0;
                this.votes -= 1;
            } else if (this.voteState === 0) {   // neutral → Up
                this.voteState = 1;
                this.votes += 1;
            } else {                             // Down aktiv → Up
                this.voteState = 1;
                this.votes += 2;
            }
            updateVoteUI();
            // TODO: fetch('/api/vote', …) sobald Backend bereit ist
        });

        downBtn.addEventListener('click', () => {
            if (this.voteState === -1) {         // Down war aktiv → neutral
                this.voteState = 0;
                this.votes += 1;
            } else if (this.voteState === 0) {   // neutral → Down
                this.voteState = -1;
                this.votes -= 1;
            } else {                             // Up aktiv → Down
                this.voteState = -1;
                this.votes -= 2;
            }
            updateVoteUI();
            // TODO: fetch('/api/vote', …)
        });


        return card;
    }
}

/**
 * Manager für alle Accommodation-Instanzen
 */
class AccommodationManager {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.items = new Map();  // id → Accommodation
    }

    /**
     * Fügt eine neue Unterkunft hinzu und rendert sie
     * @param {Accommodation} accom
     */
    add(accom) {
        if (this.items.has(accom.id)) return;
        this.items.set(accom.id, accom);
        const cardEl = accom.render();
        this.container.appendChild(cardEl);
    }

    /**
     * Löscht eine Unterkunft nach ID
     * @param {number} id
     */
    delete(id) {
        if (!this.items.has(id)) return;
        this.items.delete(id);
        const el = this.container.querySelector(`.card[data-id="${id}"]`);
        if (el) el.remove();
    }

    /**
     * Lädt neue Daten und synchronisiert die Anzeige (diff)
     * @param {Array<Object>} dataArray
     */
    sync(dataArray) {
        const newIds = new Set(dataArray.map(item => item.id));

        // Neue Einträge hinzufügen
        dataArray.forEach(data => {
            if (!this.items.has(data.id)) {
                const accom = new Accommodation(data);
                this.add(accom);
            }
        });

        // Alte Einträge entfernen
        [...this.items.keys()].forEach(id => {
            if (!newIds.has(id)) {
                this.delete(id);
            }
        });
    }
}

/**
 * Lädt die Daten von der API und synchronisiert den Manager
 */
async function updateData(manager) {
    try {
        const response = await fetch(`${API_URL}/api/data`);
        if (!response.ok) throw new Error('Fehler beim Laden der Daten');
        const data = await response.json();
        manager.sync(data);
    } catch (err) {
        console.error('Fehler beim Aktualisieren:', err);
    }
}

// ---- Initialisierung ----
document.addEventListener('DOMContentLoaded', () => {
    const manager = new AccommodationManager('#card-container');

    // "+"-Button: neue URL scrapen lassen
    const addBtn = document.getElementById('add-card-btn');
    addBtn.addEventListener('click', async () => {
        const url = prompt('Bitte die Unterkunfts-URL eingeben:');
        if (!url) return;
        try {
            await fetch(`${API_URL}/api/scrape`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            // Daten neu laden, um die neue Kachel zu sehen
            updateData(manager);
        } catch (err) {
            console.error('Fehler beim Scrapen:', err);
            alert('Konnte nicht scrapern. Schau in der Konsole nach Details.');
        }
    });


    // Initialer Load
    updateData(manager);

    // Regelmäßige Updates (alle 15 Sekunden)
    setInterval(() => updateData(manager), 15000);
});
