# Dateiverwaltung in Nodges

Die Steuerungselemente zur Dateiverwaltung (Neu, Öffnen, Speichern als) wurden erfolgreich in der Nodges-Seitenleiste unter dem Tab "Files" implementiert.

## Übersicht der Änderungen

### 1. UI-Integration (`src/ui/FilePanelUI.ts`)
* Im Dateipanel wurde eine neue Zeile "Projekt-Aktionen" mit drei Buttons hinzugegt:
  * **Neu**: Startet ein leeres Projekt.
  * **Öffnen**: Öffnet den nativen Datei-Import-Dialog über `FileHandler`.
  * **Speichern als**: Öffnet einen modalen Dialog zur Angabe von Dateiname, Format und optionalem Visualisierungszustand.
* **Premium-Modals**: Statt einfacher Browser-Dialoge wurden benutzerdefinierte, modal-basierte Dialoge für die Bestätigung von "Neu" (`showConfirmDialog`) und die Einstellungen von "Speichern als" (`showSaveAsDialog`) implementiert. Diese nutzen das bestehende Styling-System (`modal-overlay`, `modal-content`, `modal-body`, `modal-footer`) für maximale Ästhetik und Konsistenz.
* Dynamische UI-Interaktionen blenden Optionen wie "Visualisierungszustand einbeziehen" automatisch aus, wenn ein Format ungleich JSON gewählt wird.

### 2. Projekt-Zurücksetzung (`src/App.ts`)
* Die Methode `newGraph()` wurde der `App`-Klasse hinzugefügt. Sie führt folgende Schritte aus:
  * Leert die THREE.js-Szene über `clearScene()`.
  * Setzt geladene Dateien im `StateManager` zurück.
  * Setzt das Graphdaten-Objekt im `StateManager` und in der `App`-Instanz auf ein leeres Array zurück.
  * Setzt die UI-Statistiken, den Minimap-Zustand sowie die Orbit-Kamera auf die Ausgangspositionen zurück.
  * Informiert den Benutzer über eine Info-Benachrichtigung des `NotificationService`.

### 3. Datenkonvertierung beim Export
* Beim Klick auf "Speichern" im Dialog werden die Entities und Relationships in das von `ExportManager.getCurrentNetworkData` erwartete Format konvertiert und über `FileHandler.exportNetwork(...)` als Datei heruntergeladen.

---

## Verifizierung der Funktionen

Die Implementierung wurde mit einem automatisierten Browser-Test verifiziert:
1. Der Klick auf **Speichern als** öffnet das ansprechende Modal, in dem ein Dateiname und ein Format gewählt werden können.
2. Der Klick auf **Neu** öffnet den Bestätigungsdialog. Nach Bestätigung wird die gesamte Szene geleert, die Minimap zurückgesetzt, die geladenen Dateien entfernt und die Erfolgsmeldung angezeigt.
