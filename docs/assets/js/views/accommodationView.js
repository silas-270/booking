import { AccommodationManager } from '../modules/accommodationManager.js';
import { getCardsForWorkspace } from '../api/api.js';
import { createHeaderSection } from '../modules/headerControls.js';

/**
 * Rendert die Unterkunfts-Ansicht für einen bestimmten Workspace
 * @param {string} workspaceId
 * @returns {HTMLElement} – Das fertige DOM-Element zum Anhängen
 */
export function renderAccommodationView(workspaceId) {
    const container = document.createElement('div');
    container.classList.add('accommodation-view');

    const USER_ID = 'd3819fbc-9212-49ba-b162-28ed35f228fa'; // Optional dynamisch

    const manager = new AccommodationManager();

    const header = createHeaderSection(handleAddAccommodation);
    container.appendChild(header);

    async function updateData() {
        let data = [];

        try {
            data = await getCardsForWorkspace(workspaceId, USER_ID);
        } catch (err) {
            console.error('Fehler beim Laden aus API:', err);
            return;
        }

        manager.sync(data);

        const existing = container.querySelector('.accommodation-wrapper');
        if (existing) existing.remove();

        container.appendChild(manager.render());
    }

    function handleAddAccommodation() {
        console.log('Neue Unterkunft hinzufügen – Workspace:', workspaceId);
        // TODO: Dialog oder Formular einfügen
    }

    // Initialer Abruf
    updateData();
    // Optionaler Auto-Refresh
    setInterval(updateData, 15000);

    return container;
}
