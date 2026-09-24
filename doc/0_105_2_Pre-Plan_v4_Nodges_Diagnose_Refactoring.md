# Pre-Plan v4: Nodges — Diagnose, Stabilisierung & Refactoring

**Projekt:** Banixx/Nodges  
**Version des Dokuments:** v4.1 (angepasst auf Ausfuehrung durch Google Antigravity mit Gemini Flash)  
**Dokument-ID:** 0_105_2_Pre-Plan_v4_Nodges_Diagnose_Refactoring  
**Datum:** 2026-09-22  
**Ausfuehrende Instanz:** Google Antigravity Harness  
**Modell:** Gemini 3.8 Flash (High)  
**Umgebung:** Windows Host (PowerShell) mit Git, Node.js 24 LTS, DevContainer/Docker-Verbindung  

---

## 1. Ausgangslage und Kontextwechsel

Bisherige Planungsstaende (v1 bis v3) waren auf einen externen, containerbasierten "Pi Code Harness" ausgelegt. Mit Version 4.1 wird der gesamte Ablauf auf die direkte Ausfuehrung durch **Google Antigravity mit dem Modell Gemini Flash** umgestellt.

### Was bedeutet das fuer die Ausfuehrung?
1. **Tool-gestuetzte Ausfuehrung:** Antigravity verfuegt ueber ein praezises Werkzeugset (`replace_file_content`, `write_to_file`, `run_command`, `grep_search`, `find_by_name`, `view_file`), wodurch Eingriffe nicht ueber unuebersichtliche Shell-Skripte laufen muessen, sondern granular und nachvollziehbar im Dateisystem vorgenommen werden.
2. **Kontext- und Effizienzstrategie fuer das Flash-Modell:**
   - Gemini Flash liefert exzellente Ergebnisse bei hohem Durchsatz, wenn Arbeitsschritte modular, fokussiert und verifikationsgetrieben aufgebaut sind.
   - Grosse Diffs werden in ueberschaubare, testbare Einheiten zerlegt.
   - Jede Aenderung wird unmittelbar durch `npx tsc --noEmit` und `npm run test -- --run` gegengeprueft.
   - Vermeidung von Context-Bloat: Keine JSON-Dateien > 100 KB in den Kontext laden; nur strukturelle Shell-/Grep-Analysen.
3. **Planungs- und Ausfuehrungsmodus:**
   - Im aktuellen Planungsmodus modifiziert Antigravity ausschliesslich Planungsdokumente im Ordner `doc/`.
   - Sobald die Freigabe des Owners erfolgt, wechselt Antigravity in die Ausfuehrung der definierten Phasen.

---

## 2. Reale Diagnosebasis (Live-Status per 2026-09-22)

- **Aktiver Branch:** `pi` (auf Stand mit `origin/pi`, 9 Commits neuer als `main`).
- **TypeScript:** `npx tsc --noEmit` meldet 0 Fehler (Exit-Code 0).
- **Test-Suite:** Vitest besteht mit 18 Test-Suites (238 Tests gruen, 1 Suite / 1 Test skipped).
- **Vite Build:** Compiliert in 8,71 Sekunden fehlerfrei.
- **Bereinigungsstatus:** Die Mega-JSON-Dateien (`beautiful_sphere.json`, `temporal_500_nodes.json`) und Log-Dumps wurden vom User manuell aus `public/data/` entfernt. Die Aenderungen sind aktuell uncommitted im Arbeitsverzeichnis.
- **Identifizierte Gefahrenstelle:** `src/ui/FilePanelUI.ts` (Zeile 535) bindet via `import.meta.glob('/public/data/**/*.json')` alle JSON-Dateien statisch in das JavaScript-Bundle ein. Dies muss dringend entschaerft werden.
- **Zentraler Engpass:** `src/App.ts` ist mit 1.488 Zeilen eine monolithische God-Klasse, die saemtliche Services, Three.js-Aufbauten und UI-Events buendelt.

---

## 3. Verbindliche Leitplanken fuer Antigravity (Flash)

1. **Branch-Sicherheit:**
   - Basis fuer alle Arbeiten ist der Stand `origin/pi`.
   - Kein direkter Push auf `pi` oder `main`.
   - Alle Aenderungen erfolgen auf einem dedizierten Arbeits-Branch: `refactor/pi-stabilization`.
2. **Kein destruktiver History-Rewrite:**
   - Kein `git filter-repo`. Die Repo-Historie bleibt unangetastet, da die Gesamtgroesse mit ~110 MB voellig unkritisch ist.
3. **Inkrementelle Verifikation (Flash-Qualitaetssicherung):**
   - Nach jedem Teilschritt wird geprueft:
     1. `npx tsc --noEmit`
     2. `npm run test -- --run`
   - Schlaegt ein Test fehl, wird der Einzelschritt sofort korrigiert, bevor der naechste beginnt.
4. **Dokumentationsdisziplin:**
   - Saemtliche erstellten Dokumente tragen das Versionsprefix des Projekts (`0_105_2_`) und werden in `C:/Users/ich/Desktop/code/_projects/Nodges/doc/` abgelegt.
   - Alle Pfadangaben verwenden absolute Windows-Pfade mit Vorwaertsschraegstrichen (`/`).
   - Keine Verwendung von Emojis oder Emoticons.
5. **STOPP-Gates:**
   - Vor Phasenwechseln mit weitreichender Wirkung haelt Antigravity an und wartet auf Rueckmeldung des Users.

---

## 4. Phasenplan fuer die Ausfuehrung

### Phase 0: Stand sichern & Arbeits-Branch anlegen
- **0.1 Status festhalten:** Nicht versionierte Dateien pruefen.
- **0.2 Git Fetch & Sync:** `git fetch origin` ausfuehren.
- **0.3 Arbeits-Branch erstellen:**
  ```powershell
  git checkout -b refactor/pi-stabilization
  ```
- **0.4 GitHub-Sicherung:** Push des neuen Branches nach `origin/refactor/pi-stabilization`.

> **STOPP 1:** Bestaetigung des Branch-Aufsetzens durch den Owner.

---

### Phase 1: Bereinigung sichern & `.gitignore` haerten
- **1.1 Manuelle Loeschungen uebernehmen:**
  Die vom User geloeschten Mega-Dateien und Log-Dateien mit `git add -u` im Index erfassen und commiten:
  `git commit -m "cleanup: remove large generated json files and error dumps from public data"`
- **1.2 `.gitignore` anpassen:**
  In `C:/Users/ich/Desktop/code/_projects/Nodges/.gitignore` folgende Eintraege ergaenzen:
  ```gitignore
  # Generierte Graphen und LLM-Logs
  public/data/generated/
  public/data/b10/
  public/data/b12/
  public/data/b13/
  public/data/b6/
  public/data/b7/
  public/data/b8/
  public/data/g35/
  ```
- **1.3 Verifikation:** `npm run test -- --run` und `npm run build`.

---

### Phase 2: Bundle-Optimierung & Standard-Datensatz
- **2.1 Entschaerfung von `src/ui/FilePanelUI.ts`:**
  - Ersetzen des vollstaendigen JSON-Import-Globs durch eine schlanke Abfrage (z. B. via statischem Manifest oder `{ query: '?url' }`), damit zukuenftig in `public/data/` abgelegte Dateien nicht als JavaScript-Module in `dist/assets` gebuendelt werden.
- **2.2 Leichtgewichtiger Default-Graph in `src/App.ts`:**
  - `loadDefaultData()` in `src/App.ts` so anpassen, dass standardmaessig ein gueltiges Minimal-Netzwerk (z. B. `data/archiv/small.json`) geladen wird, um der App einen sauberen Initialzustand zu geben.
- **2.3 Verifikation:** `npm run build` ausfuehren und pruefen, dass die Chunks klein und uebersichtlich bleiben.

> **STOPP 2:** Vorlage des Diffs fuer `FilePanelUI.ts` und `App.ts` zur Freigabe.

---

### Phase 3: Stabilisierung & Testabsicherung
- **3.1 Dead-Code-Analyse mit Knip:**
  - Ausfuehrung von Knip im unueberwachten Modus:
    ```powershell
    npx --yes knip --no-exit-code
    ```
  - Dokumentation ungenutzter Exporte und toten Codes unter `C:/Users/ich/Desktop/code/_projects/Nodges/doc/0_105_2_knip_analyse.md`.
- **3.2 Test-Konsolidierung:**
  - Pruefung des uebersprungenen Tests `src/tests/LLMAutomated.test.ts`. Entweder mit Offline-Mocks ausstatten oder sauber dokumentiert belassen.
- **3.3 DevContainer-Health-Check:**
  - Sicherstellen, dass Vite-Server und LightRAG-Proxy im DevContainer erwartungsgemaess kommunizieren (`http://localhost:5173/lightrag-api/health`).

---

### Phase 4: Drei-Layer-Refactoring von `src/App.ts`
Antigravity zerlegt die 1.488 Zeilen von `src/App.ts` schrittweise in drei klar getrennte Layer:

1. **Data Layer (`src/data/` / `src/services/`):**
   - Kapselung von Datenlade-Routinen, Schemavalidierung und Service-Aufrufen (`DataParser`, `FileHandler`, `ImportManager`, `ExportManager`, `LightRAGService`, `LLMService`).
2. **Render Engine Layer (`src/engine/`):**
   - Kapselung des Three.js-Szenenlebenszyklus, Animationen, Node/Edge-Manager, Kamera und Layout (`SceneFactory`, `NodeManager`, `EdgeObjectsManager`, `CameraManager`, `LayoutManager`, `TrailManager`, `MapManager`).
3. **UI & Interaction Layer (`src/ui/` / `src/interaction/`):**
   - Kapselung von User-Interaktionen, Kontextmenues, lil-gui und Steuerungselementen (`UIManager`, `CentralEventManager`, `InteractionManager`, Panels).
4. **Schlanke `src/App.ts`:**
   - Dient nur noch als initialer DI-Container und Koordinator (< 250 Zeilen).

> **STOPP 3:** Vor Beginn von Phase 4 wird die genaue Dateiaufteilung und Schnittstellendefinition zur finalen Pruefung vorgelegt.

---

## 5. Definition of Done (DoD)

| Phase | Kriterium fuer Antigravity |
|---|---|
| **Phase 0** | Branch `refactor/pi-stabilization` existiert lokal und auf GitHub. |
| **Phase 1** | Geloeschte Dateien committet; `.gitignore` aktualisiert; Build und Tests gruen. |
| **Phase 2** | `FilePanelUI.ts` glob-bereinigt; Default-Daten laden stabil; Buildzeit unter 10s. |
| **Phase 3** | Knip-Bericht erstellt; keine toten Abhaengigkeiten; LightRAG-Proxy verifiziert. |
| **Phase 4** | `src/App.ts` auf < 250 Zeilen refaktoriert; Drei-Layer-Trennung aktiv; alle 238+ Tests erfolgreich; Pull Request auf GitHub bereitgestellt. |
