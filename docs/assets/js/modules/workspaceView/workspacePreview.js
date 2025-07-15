import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

const exampleImage = [{
  src: 'assets/img/ImagePlaceholder.png',
  alt: 'Platzhalterbild'
}];

export class WorkspacePreview {
  /**
   * @param {{ name: string, images?: Array<{src: string, alt: string}> }} options
   */
  constructor({ name, images = exampleImage }) {
    this.name = name;
    this.images = images;
    this.swiper = null;
    this.container = null;
  }

  /**
   * Baut das Swiper-Carousel und initialisiert Swiper.
   * @returns {HTMLElement} Die Karte mit Carousel
   */
  render() {
    // Karte
    const card = document.createElement('div');
    card.classList.add('pw-workspace-card');
    card.dataset.name = this.name;

    // .swiper-Container
    const swiperContainer = document.createElement('div');
    swiperContainer.classList.add('swiper');
    this.container = swiperContainer;

    const wrapper = document.createElement('div');
    wrapper.classList.add('swiper-wrapper');
    swiperContainer.appendChild(wrapper);

    // initiale Slides
    this.images.forEach(({ src, alt }) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');

      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.classList.add('crop');

      slide.appendChild(img);
      wrapper.appendChild(slide);
    });


    // Navigation & Pagination
    const prevBtn = document.createElement('div');
    prevBtn.classList.add('swiper-button-prev');
    const nextBtn = document.createElement('div');
    nextBtn.classList.add('swiper-button-next');
    const pagination = document.createElement('div');
    pagination.classList.add('swiper-pagination');
    pagination.classList.add('up');

    swiperContainer.append(prevBtn, nextBtn, pagination);
    card.appendChild(swiperContainer);

    // Titel / Info
    const info = document.createElement('div');
    info.classList.add('pw-workspace-card__info');
    const nameEl = document.createElement('h2');
    nameEl.textContent = this.name;
    info.appendChild(nameEl);
    card.appendChild(info);

    // Erst jetzt ins DOM gehängt, also kann Swiper hier initialisiert werden:
    this.swiper = new Swiper(this.container, {
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

  /**
   * @param {Array<{src: string, alt: string}>} newImages
   */
  updateImages(newImages) {
    if (!this.swiper || !this.container) return;
    this.images = newImages;

    const wrapper = this.container.querySelector('.swiper-wrapper');
    wrapper.innerHTML = '';  // alte Slides löschen

    newImages.forEach(({ src, alt }) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');

      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.classList.add('crop');

      slide.appendChild(img);
      wrapper.appendChild(slide);
    });

    this.swiper.update();     // Swiper-Instance aktualisieren
    this.swiper.slideTo(0);   // Zurück zum ersten Slide
  }
}
