import { renderAccommodationView } from './views/accommodationView.js';
import { renderWorkspaceView } from './views/workspaceView.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) {
        console.error('App-Container (#app) nicht gefunden!');
        return;
    }

    // Temporäre Logik zum Laden der Views
    const viewIndex = 0;

    let view;
    if (viewIndex === 0) {
      view = renderAccommodationView();
    } else if (viewIndex === 1) {
      view =  renderWorkspaceView();
    }

    app.appendChild(view);
});