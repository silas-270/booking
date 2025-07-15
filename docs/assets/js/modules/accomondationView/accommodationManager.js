import { Accommodation } from './accommodation.js';

export class AccommodationManager {
    constructor(dataArray = []) {
        this.items = new Map(); // id → Accommodation
        this.dataArray = dataArray; // Speichert die Daten, die später gerendert werden
    }

    /**
     * Fügt eine neue Unterkunft hinzu
     * @param {Accommodation} accom
     */
    add(accom) {
        if (this.items.has(accom.id)) return;
        this.items.set(accom.id, accom);
    }

    /**
     * Löscht eine Unterkunft nach ID
     * @param {number} id
     */
    delete(id) {
        this.items.delete(id);
    }

    /**
     * Synchronisiert interne Daten mit neuem Datenarray
     * @param {Array<Object>} dataArray
     */
    sync(dataArray) {
        this.dataArray = dataArray;

        const newIds = new Set(dataArray.map(d => d.id));

        // Neue hinzufügen
        dataArray.forEach(data => {
            if (!this.items.has(data.id)) {
                this.add(new Accommodation(data));
            }
        });

        // Alte entfernen
        [...this.items.keys()].forEach(id => {
            if (!newIds.has(id)) {
                this.delete(id);
            }
        });
    }

    /**
     * Rendert ein Container-Element mit allen Unterkünften
     * @returns {HTMLElement}
     */
render() {
  const wrapper = document.createElement('div');
  wrapper.className = 'accommodation-wrapper';

  const list = document.createElement('div');
  list.className = 'accommodation-container';

  this.items.forEach(accom => {
    const card = accom.render();
    list.appendChild(card);
  });

  wrapper.appendChild(list);
  return wrapper;
}

}
