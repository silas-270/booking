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
export function openGallery(images, startIdx = 0) {
    if (!galleryModal) initGalleryModal();
    galleryImages = images;
    showGalleryImage(startIdx);
    galleryModal.classList.add('open');
}