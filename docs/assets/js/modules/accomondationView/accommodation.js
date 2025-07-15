import { SVG_UP, SVG_DOWN } from "../../../img/svg-icons.js";
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

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
    }

    render() {
        const card = document.createElement('div');
        card.classList.add('accomodation-card');
        card.dataset.id = this.id;

        // .swiper-Container
        const swiperContainer = document.createElement('div');
        swiperContainer.classList.add('swiper');

        const wrapper = document.createElement('div');
        wrapper.classList.add('swiper-wrapper');
        swiperContainer.appendChild(wrapper);

        // initiale Slides
        this.images.forEach(({ src, alt }) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy" />`;
            wrapper.appendChild(slide);
        });

        // Navigation & Pagination
        const prevBtn = document.createElement('div');
        prevBtn.classList.add('swiper-button-prev');
        const nextBtn = document.createElement('div');
        nextBtn.classList.add('swiper-button-next');
        const pagination = document.createElement('div');
        pagination.classList.add('swiper-pagination');

        swiperContainer.append(prevBtn, nextBtn, pagination);
        card.appendChild(swiperContainer);

        const info = document.createElement('div');
        info.classList.add('accomodation-card__info');
        info.innerHTML = `
            <div class="accomodation-card__row1">
                <h2><a href="${this.url}" target="_blank" rel="noopener">${this.name}</a></h2>
                <div class="price">€ ${this.price ?? '–'}</div>
            </div>
            <div class="accomodation-card__row2">
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

        // Erst jetzt ins DOM gehängt, also kann Swiper hier initialisiert werden:
        const swiper = new Swiper(swiperContainer, {
        navigation: {
            nextEl: nextBtn,
            prevEl: prevBtn,
        },
        pagination: {
            el: pagination,
            clickable: true,
        },
        // ggf. observer, falls Wrapper-Höhe sich dynamisch ändert:
        observer: true,
        observeParents: true,
        });

        return card;
    }
}