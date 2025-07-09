import { SVG_UP, SVG_DOWN } from '../../img/svg-icons.js';
import { openGallery } from './gallery.js';

export class Accommodation {
    constructor({ id, name, location, price, rating, images, url }) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.price = price;
        this.rating = rating;
        this.images = images;
        this.url = url;

        this.voteState = 0; // 1: upvoted, -1: downvoted, 0: neutral

        if (Array.isArray(images)) {
            images.forEach(imgData => {
                const img = new Image();
                img.src = imgData.src;
            });
        }
    }

    render() {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = this.id;

        const swipeContainer = document.createElement('div');
        swipeContainer.classList.add('card__swipe');

        let idx = 0;
        const counter = document.createElement('div');
        counter.classList.add('card__counter');
        swipeContainer.appendChild(counter);

        const imgBox = document.createElement('div');
        imgBox.classList.add('card__imgbox');

        const updateImage = () => {
            imgBox.innerHTML = '';
            const tmp = new Image();
            tmp.alt = this.images?.[idx]?.alt ?? '';
            tmp.onload = () => {
                imgBox.appendChild(tmp);
                const total = this.images?.length || 1;
                counter.textContent = `${idx + 1}/${total}`;
                counter.classList.add('visible');
                clearTimeout(counter.hideTimeout);
                counter.hideTimeout = setTimeout(() => {
                    counter.classList.remove('visible');
                }, 1500);
            };
            tmp.src = this.images?.[idx]?.src ?? '';
        };

        updateImage();

        imgBox.onclick = () => {
            openGallery(this.images || [], idx);
        };

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

        const voteBox = document.createElement('div');
        voteBox.className = 'vote-box';

        const upBtn = document.createElement('button');
        upBtn.className = 'vote-btn vote-up';
        upBtn.innerHTML = SVG_UP;

        const countEl = document.createElement('span');
        countEl.className = 'vote-count';
        countEl.textContent = '0'; // Optional: Statisch oder rein optisch

        const divider = document.createElement('span');
        divider.className = 'vote-divider';

        const downBtn = document.createElement('button');
        downBtn.className = 'vote-btn vote-down';
        downBtn.innerHTML = SVG_DOWN;

        voteBox.append(upBtn, countEl, divider, downBtn);
        card.appendChild(voteBox);

        const updateUI = () => {
            upBtn.classList.toggle('active', this.voteState === 1);
            downBtn.classList.toggle('active', this.voteState === -1);
        };

        upBtn.addEventListener('click', () => {
            this.voteState = this.voteState === 1 ? 0 : 1;
            updateUI();
        });

        downBtn.addEventListener('click', () => {
            this.voteState = this.voteState === -1 ? 0 : -1;
            updateUI();
        });

        updateUI();
        return card;
    }
}