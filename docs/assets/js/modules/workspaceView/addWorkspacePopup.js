import { WorkspacePreview } from "./workspacePreview.js";
import { createWorkspace , fetchImages } from "../../api/api.js";
import { CONFIG } from "../../config.js";

let previewWorkspaceInstance;  // wird später die Klasse halten
let previousSearch = null;
let index = 1;

/**
 * Erstellt eine Zeile mit Input + Reload-Button
 */
function createImageInputRow() {
  const row = document.createElement("div");
  row.className = "image-input-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Tags für das Coverbild";
  input.id = "workspace-image-input";
  input.autocomplete = "off";

  const reloadButton = document.createElement("button");
  reloadButton.type = "button";
  reloadButton.id = "workspace-image-reload";
  reloadButton.className = "icon-button";
  reloadButton.setAttribute("aria-label", "Bild neu laden");
  reloadButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>`;

  reloadButton.addEventListener("click", () => {
    reloadImage(input.value);
  });

  row.append(input, reloadButton);
  return { row, input };
}

/**
 * Holt neue Bilder und ruft updateImages auf
 */
async function reloadImage(query) {
  if (!query) return;
  try {
    if (query === previousSearch) {
      index += 10;
    } else {
      previousSearch = query;
      index = 1;
    }
    const images = await fetchImages(query, index);
    if (previewWorkspaceInstance) {
      previewWorkspaceInstance.updateImages(images);
    } else {
      console.warn("Keine WorkspacePreview-Instanz vorhanden!");
    }
  } catch (err) {
    console.error("Konnte keine Bilder laden:", err);
  }
}

/**
 * Öffnet das Popup und initialisiert Vorschau-Widget + Form
 */
export function addWorkspacePopup() {
  if (document.getElementById("popup-overlay")) return;

  // Overlay + Popup-Basis
  const overlay = document.createElement("div");
  overlay.id = "popup-overlay";
  const popup = document.createElement("div");
  popup.id = "popup";
  const content = document.createElement("div");
  content.id = "popup-content";

  // Vorschau-Container & Instanz
  const previewContainer = document.createElement("div");
  previewContainer.id = "workspace-preview";
  previewWorkspaceInstance = new WorkspacePreview({ name: "Vorschau" });
  previewContainer.appendChild(previewWorkspaceInstance.render());

  // Name-Input
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Name der neuen Karte";
  nameInput.id = "workspace-name-input";
  nameInput.addEventListener("input", () => {
    const titel = nameInput.value.trim() || "Vorschau";
    previewContainer.querySelector("h2").textContent = titel;
  });

  // Bild-Input-Row
  const { row: imageInputRow } = createImageInputRow();

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.id = "popup-buttons";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Speichern";
  saveBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert("Bitte gib einen Namen ein.");
      return;
    }
    createWorkspace(name, CONFIG.UserId);
    closePopup();
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Abbrechen";
  cancelBtn.addEventListener("click", closePopup);

  btnContainer.append(saveBtn, cancelBtn);

  // Alles zusammensetzen
  content.append(previewContainer, nameInput, imageInputRow);
  popup.append(content, btnContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Klick außerhalb schließt
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closePopup();
  });
}

function closePopup() {
  document.getElementById("popup-overlay")?.remove();
}
