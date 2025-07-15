const exampleImage = {
    src: 'https://cdn.businessinsider.de/wp-content/uploads/2025/06/68507e283d5881a51c1b8358-scaled.jpg?ver=1750253348',
    alt: 'Athen ist eine der besten Hauptstädte in Europa.'
};

export class Workspace {
    constructor({ id, name, owner_id, img = exampleImage }) {
        this.id = id;
        this.name = name;
        this.img = img;
        this.owner_id = owner_id;
    }

    render() {
        const card = document.createElement('div');
        card.classList.add('workspace-card');
        card.dataset.id = this.id;

        const imgBox = document.createElement('div');
        imgBox.classList.add('workspace-card__imgbox');

        const image = new Image();
        image.src = this.img?.src || '';
        image.alt = this.img?.alt || '';
        imgBox.appendChild(image);

        card.appendChild(imgBox);

        const info = document.createElement('div');
        info.classList.add('workspace-card__info');

        const nameEl = document.createElement('h2');
        nameEl.textContent = this.name;

        info.appendChild(nameEl);
        card.appendChild(info);

        return card;
    }
}