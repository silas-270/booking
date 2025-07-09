import { CONFIG } from "../config.js";

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