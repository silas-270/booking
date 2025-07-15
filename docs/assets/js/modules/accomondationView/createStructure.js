import { addAccommodationPopup } from './addAccommodationPopup.js'

export function createStructure() {
    // Create main container div
    const container = document.createElement('div');

    // === Page heading ===
    const heading = document.createElement('h1');
    heading.textContent = 'Unterkünfte'; // Accomodations
    container.appendChild(heading);

    container.appendChild(ownWorkspaces());

    // Return the constructed container
    return container;
}

function ownWorkspaces() {
    const collectionWrapper = document.createElement('div');

    // Wrapper for heading + button
    const headingWrapper = document.createElement('div');
    headingWrapper.classList.add('workspace-heading-wrapper');

    // Section heading "My Collections"
    const myCollectionsHeading = document.createElement('h2');
    myCollectionsHeading.textContent = 'Meine Sammlungen'; // My Collections
    myCollectionsHeading.classList.add('workspace-section-heading');

    // Add workspace button
    const addButton = document.createElement('button');
    addButton.textContent = '➕ Workspace hinzufügen'; // Add workspace
    addButton.classList.add('add-workspace-button');

    addButton.onclick = () => {
        addAccommodationPopup();
    };

    // Append heading and button to wrapper
    headingWrapper.appendChild(myCollectionsHeading);
    headingWrapper.appendChild(addButton)

    collectionWrapper.appendChild(headingWrapper);

    // Create divider element
    const divider = document.createElement('div');
    divider.classList.add('divider');
    collectionWrapper.appendChild(divider);

    return collectionWrapper;
}