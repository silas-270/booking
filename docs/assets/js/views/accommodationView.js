import { createStructure } from '../modules/accomondationView/createStructure.js';
import { AccommodationManager } from '../modules/accomondationView/accommodationManager.js';
import { getCardsForWorkspace } from '../api/api.js';
import { CONFIG } from '../config.js';

/**
 * Rendert die Unterkunfts-Ansicht für einen bestimmten Workspace
 * @returns {HTMLElement} – Das fertige DOM-Element zum Anhängen
 */
export function renderAccommodationView() {
    const container = createStructure();
    container.classList.add('accommodation-view');

    const manager = new AccommodationManager();

    async function updateData() {
        let data = [];

        try {
            data = await getCardsForWorkspace(CONFIG.WorkspaceId, CONFIG.UserId);
        } catch (err) {
            console.error('Fehler beim Laden aus API:', err);
            return;
        }

        manager.sync(data);

        const existing = container.querySelector('.accommodation-wrapper');
        if (existing) existing.remove();

        container.appendChild(manager.render());
    }

    // Initialer Abruf
    updateData();
    // Optionaler Auto-Refresh
    //setInterval(updateData, 15000);

    return container;
}
