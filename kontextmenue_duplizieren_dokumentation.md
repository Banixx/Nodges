# Dokumentation: Kontextmenü-Anpassungen & Duplizieren

Das Kontextmenü für existierende Knoten und Verbindungen im 3D-Raum wurde angepasst, um eine präzisere und passendere Steuerung zu ermöglichen.

## Änderungen am Kontextmenü

Bisher wurde beim Rechtsklick auf ein existierendes Element ein generisches Menü (inklusive "Neuer Node") angezeigt und das objektspezifische Feld "Data" nur angehängt. Nun unterscheidet das Menü strikt nach Kontext:

1. **Rechtsklick auf freien Raum**:
   - *Neuer Node* (Startet Knotenerstellung)
   - *Neue Edge* (Startet Kantenverbindung, falls ein Node selektiert ist)
   - *Duplizieren* (Dupliziert die aktuelle Auswahl)

2. **Rechtsklick auf einen existierenden Knoten**:
   - *Data* (Öffnet den Data-Editor für diesen Knoten)
   - *Move* (Aktiviert den dreistufigen Verschiebungsmodus an der aktuellen Position)
   - *Delete* (Löscht den Knoten)
   - *Duplicate* (Erstellt eine Kopie des Knotens mit leichtem Offset)

3. **Rechtsklick auf eine existierende Verbindung (Edge)**:
   - *Data* (Öffnet den Data-Editor für diese Verbindung)
   - *Delete* (Löscht die Verbindung)
   - *Duplicate* (Erstellt eine Kopie der Verbindung)

---

## Fehlerbehebung und Implementierung

### 1. Duplizieren-Funktionalität
Das Duplizieren von Knoten und Verbindungen war über Events (`node_created`, `edge_created`) aufgesetzt, auf die das System jedoch an keiner Stelle gelauscht hat.
- **Lösung**: In `SelectionHandler.ts` wurden die Methoden `duplicateNode` und `duplicateEdge` umgeschrieben. Die erzeugten Elemente werden nun direkt über `this.stateManager.addNode()` bzw. `this.stateManager.addEdge()` in den globalen Zustand überführt. 
- Das duplizierte Element erhält automatisch den Namenszusatz `(Kopie)`.

### 2. Verschiebe-Modus ("Move")
Es wurde eine neue Methode `moveExistingNode(node: THREE.Object3D)` in `NodeCreationHandler.ts` implementiert. Diese startet den `AxisPositionHelper` an der tatsächlichen 3D-Weltposition des Knotens. Nach Abschluss der dreistufigen Bestätigung wird die neue Position im StateManager aktualisiert.
