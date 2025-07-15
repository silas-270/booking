import { CONFIG } from '../config.js';

/**
 * 1. Workspace erstellen
 * @param {string} name - Name des Workspaces
 * @param {string} ownerId - ID des Benutzers (owner)
 * @returns {Promise<Object>}
 */
export async function createWorkspace(name, ownerId) {
  const response = await fetch(`${CONFIG.API_URL}/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, ownerId }),
  });
  return await response.json();
}

/**
 * 2. Karte zu Workspace hinzufügen
 * @param {string} workspaceId - ID des Ziel-Workspaces
 * @param {Object} cardData - Daten zur Karte
 * @param {string} cardData.name
 * @param {string} cardData.location
 * @param {number} cardData.price
 * @param {number} cardData.rating
 * @param {string[]} cardData.images
 * @param {string} cardData.url
 * @param {string} cardData.createdBy
 * @returns {Promise<Object>}
 */
export async function addCardToWorkspace(workspaceId, cardData) {
  const response = await fetch(`${CONFIG.API_URL}/workspaces/${workspaceId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return await response.json();
}

/**
 * 3. Alle Workspaces eines Users abrufen
 * @param {string} userId - Benutzer-ID
 * @returns {Promise<Object[]>}
 */
export async function getUserWorkspaces(userId) {
  const response = await fetch(`${CONFIG.API_URL}/users/${userId}/workspaces`);
  return await response.json();
}

/**
 * 4. Karten eines Workspace abrufen (mit User-Check)
 * @param {string} workspaceId - ID des Workspaces
 * @param {string} userId - ID des Users für Berechtigungsprüfung
 * @returns {Promise<Object[]>}
 */
export async function getCardsForWorkspace(workspaceId, userId) {
  const response = await fetch(`${CONFIG.API_URL}/workspaces/${workspaceId}/cards?userId=${userId}`);
  return await response.json();
}

/**
 * Ruft Bilder vom Backend ab, die über Unsplash gesucht wurden.
 * @param {string} query - Der Suchbegriff für die Bildersuche.
 * @param {number} [index=1] - Die Seitennummer für die Paginierung.
 * @returns {Promise<Array<{ alt: string, src: string }>>} - Eine Liste von Bildern mit `alt` und `src`.
 * @throws {Error} - Wenn der Abruf fehlschlägt.
 */
export async function fetchImages(query, index = 1) {
  if (!query || typeof query !== 'string') {
    throw new Error('Ein gültiger Suchbegriff (query) muss übergeben werden.');
  }

  if (typeof index !== 'number' || index < 1) {
    throw new Error('Der Parameter "index" muss eine positive Zahl sein.');
  }

  try {
    const url = `${CONFIG.API_URL}/api/images?q=${encodeURIComponent(query)}&index=${index}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unbekannter Fehler beim Abrufen der Bilder');
    }

    const images = await response.json();
    return images; // Array mit Objekten { alt, src }
  } catch (error) {
    console.error('Fehler beim Abrufen der Bilder:', error);
    throw error;
  }
}