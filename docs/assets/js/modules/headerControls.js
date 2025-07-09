export function createHeaderSection(onAddClicked) {
    const container = document.createElement('div');
    container.classList.add('header-controls');

    const heading = document.createElement('h1');
    heading.textContent = 'Ferienunterkünfte';

    const button = document.createElement('button');
    button.id = 'add-card-btn';
    button.textContent = '+ Neue Unterkunft';
    button.addEventListener('click', onAddClicked);

    container.appendChild(heading);
    container.appendChild(button);

    return container;
}