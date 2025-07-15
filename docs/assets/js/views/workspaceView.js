import { createStructure } from '../modules/workspaceView/createStructure.js';
import { WorkspaceManager } from '../modules/workspaceView/workspaceManager.js';
import { getUserWorkspaces } from '../api/api.js';
import { CONFIG } from '../config.js';

export function renderWorkspaceView() {
    const container = createStructure();
    container.classList.add('workspace-view');

    const manager = new WorkspaceManager();

    async function updateData() {
        let data = [];

        try {
            data = await getUserWorkspaces(CONFIG.UserId);
        } catch (err) {
            console.error('Fehler beim Laden aus API:', err);
            return;
        }

        manager.sync(data);

        // Neue gerenderte Container erzeugen
        const ownContainer = manager.renderOwnWorkspaces(CONFIG.UserId);
        const sharedContainer = manager.renderSharedWorkspaces(CONFIG.UserId);

        // Ziel-Container ersetzen
        const oldOwn = container.querySelector('.workspace-container-own');
        const oldShared = container.querySelector('.workspace-container-shared');

        if (oldOwn && oldOwn.parentNode) oldOwn.replaceWith(ownContainer);
        if (oldShared && oldShared.parentNode) oldShared.replaceWith(sharedContainer);
    }

    updateData();
    //setInterval(updateData, 15000);

    return container;
}
