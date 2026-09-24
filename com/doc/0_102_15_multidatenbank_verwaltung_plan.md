# Konzept und Umsetzungsplan: Multi-Datenbank-Verwaltung in Nodges

## 1. Problemstellung und Zielsetzung
Derzeit nutzt Nodges eine primare globale Datenbank-Struktur fuer den Wissensgraphen (in `c:/Users/ich/Desktop/code/_projects/Nodges/rag_storage` fuer LightRAG sowie in `public/data/` fuer JSON-Graphdaten).
Neu einzulesende Dokumente und Entitaeten werden kumulativ in diesen einen Speicherort geschrieben.

Das Ziel dieser Erweiterung ist es, eine vollstaendige Multi-Datenbank-Verwaltung einzufuehren. Benutzer sollen:
1. Beliebig viele separate Datenbanken (Wissensgraphen / Datensaetze) erstellen können.
2. Zwischen existierenden Datenbanken nahtlos wechseln und diese laden koennen.
3. Den aktuellen Stand einer gewaehlten Datenbank explizit speichern ("Speichern" und "Speichern unter...").
4. Nicht mehr benoetigte Datenbanken verwalten oder loeschen koennen.

---

## 2. Architektur & Komponenten

### A. Backend-Erweiterung (LightRAG Python API `lightrag-backend/main.py`)
- **Dynamisches Storage-Verzeichnis:**
  Unterstuetzung fuer Unterordner pro Datenbank in `rag_storage/databases/<db_id>/`.
- **Neue REST-Endpunkte:**
  - `GET /databases`: Liefert eine Liste aller verfuegbaren LightRAG-Datenbanken mit Metadaten (Knotenanzahl, Kantenanzahl, Speicherdatensätze).
  - `POST /databases/create`: Erstellt ein neues Verzeichnis und initialisiert eine leere LightRAG-Instanz für eine neue Datenbank.
  - `POST /databases/select`: Wechselt die aktive `rag_instance` auf ein anderes Datenbankverzeichnis.
  - `DELETE /databases/{db_id}`: Loescht ein Datenbankverzeichnis.

### B. Vite Server API Extension (`vite.config.ts`)
- Erweiterung des Dateisystem-Handlers fuer lokales Graph-JSON:
  - Ordnerstruktur: `public/data/databases/`
  - `GET /api/databases`: Auflisten verfuegbarer Graph-Datenbanken.
  - `POST /api/create_database`: Anlegen einer neuen leeren Graph-JSON-Datenbank.
  - `POST /api/save_database`: Speichern der aktiven Graph-Datenbank unter angegebenem Namen.

### C. Frontend Core Integration (`src/core/StateManager.ts`, `src/App.ts`)
- **State-Erweiterung:**
  - Speicherung von `activeDatabase`: `{ id: string, name: string, path: string, type: 'lightrag' | 'json' }`.
  - Bereitstellung von Umschalt- und Ladefunktionen mit automatischem Reset der 3D-Szene.

### D. UI-Komponente (`src/ui/FilePanelUI.ts`)
- **Neuer UI-Bereich "Datenbank-Verwaltung":**
  - Dropdown-Menue zur Auswahl der aktiven Datenbank.
  - Buttons: "Neue Datenbank", "Speichern", "Speichern als...", "Datenbank loeschen".
  - Statusanzeige der aktuell geladenen Datenbank im Header oder Panel.

---

## 3. Schritt-fuer-Schritt Umsetzungsplan

1. **Phase 1: Backend & Server-APIs**
   - Hinzufuegen von Multi-Database Endpunkten in `lightrag-backend/main.py`.
   - Hinzufuegen von Dateisystem-APIs in `vite.config.ts` unter `public/data/databases/`.

2. **Phase 2: Core State & Manager**
   - Erweitern von `StateManager` und `FileHandler` um Datenbank-Auswahl und Speicher-Methoden.
   - Methode `app.switchDatabase(dbId)` zur Koordination von Scene-Reset und Laden der neuen Daten.

3. **Phase 3: Frontend UI**
   - Integration der Datenbank-Steuerung in `FilePanelUI.ts`.
   - Dialoge fuer "Neue Datenbank erstellen" und "Datenbank speichern unter...".

4. **Phase 4: Verifikation & Test**
   - Testen des Erstellens zweier separater Datenbanken.
   - Einfuegen unterschiedlicher Dokumente/Knoten in beide Datenbanken.
   - Verifizieren, dass beim Wechseln zwischen den Datenbanken die korrekten Entitaeten geladen und angezeigt werden.

---

## 4. Beteiligte Dateien

- `[MODIFY]` [main.py](file:///c:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py)
- `[MODIFY]` [vite.config.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/vite.config.ts)
- `[MODIFY]` [FilePanelUI.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/FilePanelUI.ts)
- `[MODIFY]` [FileHandler.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/FileHandler.ts)
- `[MODIFY]` [StateManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts)
- `[NEW]` [0_102_15_multidatenbank_verwaltung_plan.md](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_15_multidatenbank_verwaltung_plan.md)
