import { renderAccommodationView } from './views/accommodationView.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) {
        console.error('App-Container (#app) nicht gefunden!');
        return;
    }

    const WORKSPACE_ID = '2b059a79-2911-4ec9-899d-59dd1b01f582'; // Später dynamisch

    const view = renderAccommodationView(WORKSPACE_ID);
    app.appendChild(view);
});
