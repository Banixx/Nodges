# Walkthrough: Multi-Datenbank-Verwaltung in Nodges

Die Multi-Datenbank-Verwaltung erlaubt das Erstellen, Speichern, Laden, Umschalten und Loeschen mehrerer separater Datenbanken in Nodges.

## Durchgefuehrte Aenderungen

### 1. Python LightRAG Backend (`lightrag-backend/main.py`)
- Unterstuetzung fuer multiple Datenbanken im Verzeichnis `./rag_storage/databases/<db_name>`.
- Neue API-Endpunkte:
  - `GET /databases`: Liste aller verfuegbaren LightRAG-Datenbanken.
  - `POST /databases/create`: Erstellt und aktiviert eine neue LightRAG-Datenbank.
  - `POST /databases/select`: Aktiviert eine bestehende LightRAG-Datenbank.
  - `DELETE /databases/{db_name}`: Loescht eine LightRAG-Datenbank.

### 2. Vite Server API Extension (`vite.config.ts`)
- Endpunkt `/api/create_database`: Erstellt neue JSON-Graphdatenbanken in `public/data/databases/`.
- Endpunkt `/api/delete_file`: Erlaubt das Loeschen von Datenbank-Dateien aus `public/data/`.

### 3. Core State & Utility Manager (`StateManager.ts`, `FileHandler.ts`)
- `StateManager`: Erweiterung um `activeDatabase` State-Attribut mit automatischem Event-Trigger bei Datenbank-Wechsel.
- `FileHandler`: Neue Hilfsmethoden `createNewDatabase()`, `saveCurrentDatabase()`, `deleteDatabaseFile()`.

### 4. Frontend UI (`FilePanelUI.ts`)
- Neuer Sektions-Header **"Datenbank-Verwaltung"** im Dateipanel.
- Dropdown-Auswahl der aktiven Datenbank (Sowohl JSON- als auch LightRAG-Datenbanken).
- Drei Aktions-Buttons:
  - `+ Neue DB`: Oeffnet Dialog zum Erstellen einer neuen JSON- oder LightRAG-Datenbank.
  - `DB Speichern`: Speichert den aktuellen Wissensgraphen in der aktiven Datenbank.
  - `DB Loeschen`: Loescht die ausgewaehlte Datenbank nach Bestaetigung.

---

## Verifikation
- Build-Prozess mit `npm run build` gestartet.
- Ueberpruefung der Typisierung und Funktionalitaet aller Endpunkte und UI-Komponenten.
