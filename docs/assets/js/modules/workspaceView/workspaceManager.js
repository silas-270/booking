import { Workspace } from './workspace.js';

export class WorkspaceManager {
    constructor(dataArray = []) {
        this.items = new Map(); // id → Workspace
        this.dataArray = dataArray;
    }

    add(work) {
        if (this.items.has(work.id)) return;
        this.items.set(work.id, work);
    }

    delete(id) {
        this.items.delete(id);
    }

    sync(dataArray) {
        this.dataArray = dataArray;

        const newIds = new Set(dataArray.map(d => d.id));

        dataArray.forEach(data => {
            if (!this.items.has(data.id)) {
                this.add(new Workspace(data));
            }
        });

        [...this.items.keys()].forEach(id => {
            if (!newIds.has(id)) {
                this.delete(id);
            }
        });
    }

    renderSingle(data) {
        let workspace = this.items.get(data.id);

        if (!workspace) {
            workspace = new Workspace(data);
            this.add(workspace);
        }

        return workspace.render();
    }

    /**
     * Rendert alle eigenen Workspaces
     * @param {string|number} userId
     * @returns {HTMLElement}
     */
    renderOwnWorkspaces(userId) {
        const container = document.createElement('div');
        container.className = 'workspace-container-own';

        this.dataArray
            .filter(ws => ws.owner_id === userId)
            .forEach(ws => {
                container.appendChild(this.renderSingle(ws));
            });

        return container;
    }

    /**
     * Rendert alle geteilten Workspaces
     * @param {string|number} userId
     * @returns {HTMLElement}
     */
    renderSharedWorkspaces(userId) {
        const container = document.createElement('div');
        container.className = 'workspace-container-shared';

        this.dataArray
            .filter(ws => ws.owner_id !== userId)
            .forEach(ws => {
                container.appendChild(this.renderSingle(ws));
            });

        return container;
    }
}
