export function addAccommodationPopup() {
  if (document.getElementById("popup-overlay")) return;

  // Overlay + Popup-Basis
  const overlay = document.createElement("div");
  overlay.id = "popup-overlay";
  const popup = document.createElement("div");
  popup.id = "popup";
  const content = document.createElement("div");
  content.id = "popup-content";

  // Name-Input
  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.placeholder = "Name der neuen Karte";
  urlInput.id = "workspace-name-input";

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.id = "popup-buttons";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Speichern";
  saveBtn.addEventListener("click", () => {
    const booking_url = urlInput.value.trim();
    if (!booking_url) {
      alert("Bitte gib eine url ein.");
      return;
    }
    console.log(`Erstelle Accom durch url: ${booking_url}`)
    //createAccommodation(name, CONFIG.UserId);
    closePopup();
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Abbrechen";
  cancelBtn.addEventListener("click", closePopup);

  btnContainer.append(saveBtn, cancelBtn);

  // Alles zusammensetzen
  content.append(urlInput);
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