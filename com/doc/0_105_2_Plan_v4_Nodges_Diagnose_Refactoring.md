# Plan v4: Nodges — Diagnose, Stabilisierung & Refactoring

**Projekt:** Banixx/Nodges  
**Basis:** Pre-Plan v3 (ueberarbeitet, empirisch verifiziert und auf realer Codebasis erprobt)  
**Dokument-ID:** 0_105_2_Plan_v4_Nodges_Diagnose_Refactoring  
**Version:** v4.0 (Endfassung)  
**Datum:** 2026-09-22  
**Zielsystem:** Dual-kompatibel fuer Google Antigravity (Gemini Flash) sowie autarken Pi Code Harness (DevContainer / WSL)  

---

## 1. Aenderungen gegenueber v3 — Zusammenfassung & Erfahrungsgewinn

Die praktische Ausfuehrung und Diagnose am Live-Code haben wesentliche Fehleinschaetzungen und Luecken in v3 aufgedeckt und korrigiert:

1. **Reale Git-Branch-Architektur (`origin/pi` statt `main`):**  
   v3 setzte unreflektiert voraus, dass auf `main` gearbeitet wird. In der Praxis ist `origin/pi` der aktive Entwicklungszweig und `main` um 9 Commits voraus (u. a. LightRAG-Container-Setup, Docker-Integration, Version 0.103 bis 0.105.2). Ein Abzweig von `main` haette diese Arbeit abgeschnitten. In v4 ist `origin/pi` als verbindliche Basis definiert.
2. **Entlarvung des wahren Bundle-Bloat-Treibers (`import.meta.glob`):**  
   v3 vermutete das Problem der Mega-Dateien (`beautiful_sphere.json`, `temporal_500_nodes.json`) nur als Laufzeit- und RAM-Risiko im Browser. Die reale Ursache fuer die 18,7s lange Build-Zeit und riesige 9-MB-JS-Assets war der Aufruf `import.meta.glob('/public/data/**/*.json')` in `src/ui/FilePanelUI.ts` (Zeile 535), welcher Vite dazu veranlasste, *jede* gefundene JSON als JavaScript-Chunk zu buendeln. Die Entschaerfung auf `{ query: '?url' }` reduzierte die Chunks von bis zu 5,58 MB auf 0,14 kB und halbierte die Build-Dauer sofort auf 8,26s.
3. **Expliziter Verzicht auf destruktiven History-Rewrite (`filter-repo`):**  
   v3 hielt sich einen History-Rewrite offen. Die Pruefung ergab: Die beiden Mega-Dateien wurden nur in einem einzigen historischen Commit (`e949f0d` / 0.102.12) hinzugefuegt. Die gesamte `.git`-Ordnergroesse betraegt lediglich ~110 MB. Ein Force-Rewrite wuerde saemtliche Commit-Hashes zerstoeren und Forks/Branches brechen. In v4 wird der History-Rewrite als unnoetig verworfen.
4. **Beseitigung von Geister-Dateien und Praezisierung des Entry-Points:**  
   v3 verwies auf `src/main.ts` und `src/index.ts`. Beide Dateien existieren nicht. Der reale Einstiegspunkt ist `src/App.ts`, welcher ueber `SceneFactory.setup` das Canvas dynamisch in den DOM einhaengt.
5. **Praxiserprobte Drei-Layer-Architektur:**  
   Die in v3 theoretisch geforderte Entflechtung der 1.490 Zeilen von `src/App.ts` wurde praktisch umgesetzt und validiert:
   - `src/core/DataManager.ts` (Data Layer): Kapselt Laden, Schemas, Merging und Metriken.
   - `src/core/RenderEngine.ts` (Engine Layer): Kapselt Three.js-Szenen, Meshes, Bounds und Render-Loop.
   - `src/App.ts`: Verschlankt auf einen DI-Orchestrator und Koordinator (486 Zeilen).
6. **Tooling-Fallen fuer autonome Harnesses geloest:**  
   - `knip` ist nicht im Repository vorinstalliert. Ein Aufruf via `npx` muss zwingend `npx --yes knip --no-exit-code` lauten, um interaktive Prompts zu verhindern.
   - Knip deckte echten toten Code auf (`deno-proxy/index.ts`, `src/workers/layout-worker.js`), der entfernt wurde.
   - Knip entlarvte `lil-gui` als voellig ungenutzte Abhaengigkeit (UI basiert auf eigenem HTML).
   - Globales Reformatting (Prettier/ESLint) ueber alle 105 TS-Dateien wurde verworfen, um Git-Blame-Zerstoerung zu verhindern.
7. **DevContainer-Laufzeitumgebung verankert:**  
   Gemaess `AGENTS.md` belegt Vite standardmaessig Port 5173 (PID 1). Befehle wie `ps`, `pkill` fehlen im Container. LightRAG laeuft im Container auf Port 8000 mit OpenRouter Embeddings (`qwen3-embedding-8b`).

---

## 2. Reale Diagnosebasis & Verifikationsmetriken

| Metrik / Bereich | Ausgangszustand (v3-Annahme) | Realer Endzustand (v4 verifiziert) |
|---|---|---|
| **Aktiver Branch** | Unklar / `main` vermutet | `origin/pi` (Basis) -> `refactor/pi-stabilization` |
| **Mega-Dateien in `public/`** | 24,6 MB Roh-JSONs getrackt | Vollstaendig geloescht (68 Dateien, 1,16 Mio. Zeilen bereinigt) |
| **Gitignore-Schutz** | `public/data/generated` ungeschuetzt | Abgesichert gegen `generated/`, `b10/`, `b12/`, `b13/`, `b6/`, `b7/`, `b8/`, `g35/`, `temporal/` |
| **Vite-Glob-Import** | Bundelt alle JSONs als JS-Module | `{ query: '?url' }` aktiv, Chunks nur noch 0,14 kB |
| **Vite Build-Dauer** | 18,7 Sekunden | 8,26 Sekunden (mehr als halbiert) |
| **TypeScript-Kompilierung** | Ungeprueft | 0 Fehler (`npx tsc --noEmit` Exit-Code 0) |
| **Vitest-Testsuite** | Ungeprueft | 18 Test-Suites, 238 Tests gruen (0 Fehler) |
| **Architektur `src/App.ts`** | Monolith mit 1.490 Zeilen | Drei-Layer-Aufteilung: `DataManager`, `RenderEngine`, `App.ts` |
| **LightRAG-Backend** | Unbekannt | Port 8000 online, Embedding-Engine aktiv |

---

## 3. Verbindliche Leitplanken fuer den Betrieb

1. **Branch-Disziplin:**
   - Basis ist ausschliesslich `origin/pi`.
   - Alle Aenderungen laufen ueber dedizierte Arbeits-Branches (z. B. `refactor/pi-stabilization`). Kein Direct-Push auf `main` oder `pi`.
2. **Kein History-Rewrite:**
   - Kein `git filter-repo`, kein Force-Push. Das Repository umfasst ~110 MB und ist stabil.
3. **Inkrementelle Verifikation (Qualitaets-Gate):**
   - Nach jeder Code-Modifikation muessen folgende Pruefungen bestanden werden:
     1. `npx tsc --noEmit` (Typensicherheit)
     2. `npm run test -- --run` (Logik und Regressionstests)
     3. `npm run build` (Bundle- und Syntaxtests)
4. **Schutz vor Kontext-Ueberlauf:**
   - Datensaetze oder Logs > 100 KB duerfen niemals per Volltext in den LLM-Kontext geladen werden; Analysen erfolgen rein strukturell ueber Shell-Werkzeuge.
5. **Secrets-Schutz:**
   - OpenRouter-Keys und Tokens duerfen nur ueber Umgebungsvariablen bereitgestellt werden. Vor jedem Commit erfolgt eine Diff-Pruefung auf geheime Schluessel.
6. **STOPP-Gates:**
   - Vor destruktiven Datei-Operationen oder strukturellen Aenderungen muss eine Bestaetigung des Owners eingeholt werden.

---

## 4. Schritt-fuer-Schritt Ausfuehrungsplan

### Phase 0: Stand abgleichen & Arbeits-Branch anlegen
- **0.1 Lokalen Zustand erfassen:** `git status` ausfuehren, unversionierte Dateien pruefen.
- **0.2 Remote-Synchronisation:** `git fetch origin` ausfuehren. Pruefen, ob `origin/pi` neue Commits enthaelt.
- **0.3 Arbeits-Branch ableiten:**
  ```powershell
  git checkout -b refactor/pi-stabilization origin/pi
  ```
- **0.4 GitHub-Sicherung:** Arbeits-Branch zu GitHub pushen (`git push -u origin refactor/pi-stabilization`).

> **STOPP 1 — Freigabe erforderlich:** Bestaetigung der Branch-Basis durch den Owner vor weiteren Schritten.

---

### Phase 0b: GitHub-Sicherheit & Secrets-Audit
- **0.1 Secrets-Check:** Sicherstellen, dass weder `.env` noch Tokens im Git-Index liegen.
- **0.2 Branch Protection:** Verifizieren, dass `main` und `pi` gegen unbeabsichtigte Direct-Pushes geschuetzt sind.
- **0.3 Pull-Request-Prinzip:** Alle spaeteren Aenderungen werden als GitHub Pull Request zurueckgefuehrt.

---

### Phase 1: Zustand testen & empirische Diagnose
- **1.1 Laufzeit-Check:** Node.js-Version pruefen (Node >= 20 LTS verifiziert; Node 24 aktiv).
- **1.2 Abhaengigkeiten:** `npm ci` ausfuehren.
- **1.3 TypeScript-Check:** `npx tsc --noEmit` ausfuehren und loggen.
- **1.4 Test-Suite:** `npm run test -- --run` ausfuehren und Ergebnisse erfassen.
- **1.5 Build-Test:** `npm run build` ausfuehren, Chunks und Build-Dauer protokollieren.
- **1.6 DevContainer-Check:** Pruefen, ob LightRAG auf Port 8000 online ist (`curl -s http://localhost:8000/health`).

---

### Phase 2: Datenbereinigung, Gitignore-Haertung & Bundle-Optimierung
- **2.1 Bloat- und Log-Dateien entfernen:**
  - `beautiful_sphere.json` und `temporal_500_nodes.json` sowie alte Dumps (`LLM_ERROR_RAW_*`, `b10/`, `b12/`, etc.) entfernen.
  - Mit `git add -u public/data` erfassen und commiten:
    `git commit -m "cleanup: remove large generated json files and error dumps from public data"`
- **2.2 `.gitignore` absichern:**
  - Folgende Pfade verbindlich in `C:/Users/ich/Desktop/code/_projects/Nodges/.gitignore` hinterlegen:
    ```gitignore
    public/data/generated/
    public/data/b10/
    public/data/b12/
    public/data/b13/
    public/data/b6/
    public/data/b7/
    public/data/b8/
    public/data/g35/
    public/data/temporal/
    ```
- **2.3 Vite Glob-Import entschaerfen:**
  - In `src/ui/FilePanelUI.ts` (Zeile 535) `import.meta.glob('/public/data/**/*.json', { query: '?url' })` konfigurieren, um unerwuenschtes JS-Bundling zu verhindern.
- **2.4 Standard-Start-Graph hinterlegen:**
  - In `src/App.ts` `loadDefaultData()` so implementieren, dass `data/archiv/small.json` beim Start geladen wird.
- **2.5 Verifikation:** `npm run build` muss unter 10 Sekunden abschliessen; die Einzel-Chunks duerfen 0,5 kB nicht ueberschreiten.

> **STOPP 2 — Freigabe erforderlich:** Pruefung des Diffs fuer `FilePanelUI.ts`, `App.ts` und `.gitignore` vor Phase 3.

---

### Phase 3: Core-Stabilisierung & Dead-Code-Audit
- **3.1 Dead-Code-Analyse mit Knip:**
  - Knip im nicht-interaktiven Modus ausfuehren:
    ```powershell
    npx --yes knip --no-exit-code
    ```
  - Befunde dokumentieren in `C:/Users/ich/Desktop/code/_projects/Nodges/doc/0_105_2_knip_analyse.md`.
- **3.2 Totes Material entfernen:**
  - Ungenutzte Altlasten (`deno-proxy/index.ts`, `src/workers/layout-worker.js`) via `git rm` entfernen und commiten.
- **3.3 Test-Suite-Konsolidierung:**
  - Pruefen, dass `src/tests/LLMAutomated.test.ts` als `skip` markiert bleibt (da es echte OpenRouter-Credits verbraucht).
  - Alle 238 Unit- und Integrationstests muessen gruen durchlaufen.

---

### Phase 4: Drei-Layer-Refactoring von `src/App.ts`
Die ehemals 1.490 Zeilen umfassende God-Klasse `src/App.ts` wird in drei strikt getrennte Schichten unterteilt:

1. **Data Layer (`src/core/DataManager.ts`):**
   - Zustaendigkeit: Laden (`loadData`, `loadGraphData`, `addData`), Schema-Merging (`rebuildMergedSchema`), Schema-Validierung, Metrikberechnung (`computeGraphMetrics`, `calculateDerivedData`) und Datensatz-Entfernung (`removeData`).
   - Registrierung im `ServiceContainer` unter dem Schluessel `'DataManager'`.
2. **Render Engine Layer (`src/core/RenderEngine.ts`):**
   - Zustaendigkeit: Three.js Szene, Kamera, Renderer, OrbitControls, Lichter, Mesh-Erzeugung (`createNodes`, `createEdges`), Bounds-Berechnung (`calculateBounds`), Kamera-Fitting (`fitCameraToScene`), Visual Balance (`applyVisualBalance`) und der vollstaendige Render-Loop (`animate`, `startRenderLoop`, `destroy`).
   - Registrierung im `ServiceContainer` unter dem Schluessel `'RenderEngine'`.
3. **UI & Interaction Layer (Bestehend & Konsolidiert):**
   - `UIManager`, `CentralEventManager`, `InteractionManager`, `FilePanelUI`, `CreatePanel`.
4. **Schlanker Koordinator (`src/App.ts`):**
   - Verschlankt auf unter 500 Zeilen.
   - Zustaendigkeit: Initialisierung, Service-Registrierung im `ServiceContainer`, Event-Subscriptions und Weiterleitung an `DataManager` und `RenderEngine`.

> **STOPP 3 — Freigabe erforderlich:** Vorlage des Refactoring-Diffs zur Bestaetigung der Rueckwaertskompatibilitaet aller oeffentlichen Schnittstellen.

---

### Phase 5: Abschluss, Pull Request & Dokumentation
- **5.1 Endabnahme:**
  - `npx tsc --noEmit`: 0 Fehler
  - `npm run test -- --run`: 238 Tests bestanden
  - `npm run build`: 8,26s Buildzeit
- **5.2 Dokumentation:**
  - Walkthrough und Phasenergebnisse in `C:/Users/ich/Desktop/code/_projects/Nodges/doc/` festhalten.
- **5.3 GitHub Pull Request:**
  - PR von `refactor/pi-stabilization` auf `pi` erstellen, inklusive vollstaendiger Beschreibung aller Optimierungen.

---

## 5. Definition of Done (DoD) je Phase

| Phase | Kriterium fuer Fertigstellung |
|---|---|
| **Phase 0 — Synchronisation** | Basis `origin/pi` bestaetigt; dedizierter Branch `refactor/pi-stabilization` angelegt und zu GitHub gepusht. |
| **Phase 0b — Absicherung** | Secrets-Audit bestanden; keine sensiblen Daten im Index; PR-Workflow vorbereitet. |
| **Phase 1 — Zustand testen** | `tsc`, Vitest und Build einzeln ausgefuehrt; Baseline-Metriken exakt dokumentiert. |
| **Phase 2 — Datenbereinigung** | 68 Bloat-Dateien entfernt; `.gitignore` schuetzt gegen kuenftigen Bloat; Vite-Glob entschaerft; Build < 10s. |
| **Phase 3 — Stabilisierung** | Knip-Bericht erstellt; tote Dateien (`deno-proxy`, `layout-worker.js`) entfernt; LightRAG online. |
| **Phase 4 — Refactoring** | Drei-Layer-Architektur implementiert (`DataManager`, `RenderEngine`, `App.ts`); alle 238 Tests gruen; TypeScript 0 Fehler. |
| **Phase 5 — Abschluss** | Walkthrough erstellt; Arbeitsverzeichnis sauber; Pull Request bereit zur Begutachtung. |

---

## 6. Wichtige Praxishinweise fuer kuenftige Arbeiten

1. **JSON-Speicherung ueber die UI:**  
   Die UI speichert neue Graphen ueber `/api/save_graph` in `public/data/generated/`. Durch die v4-Aenderungen an `.gitignore` und `FilePanelUI.ts` gelangen diese Dateien nicht mehr versehentlich ins Git-Repository und blaehen den Production-Build nicht mehr auf.
2. **DevContainer-Prozessmanagement:**  
   Sollte Port 5173 belegt sein (da der Container mit `npm run dev` startet), muss der Dev-Server mit `npm run dev -- --port 5174` aufgerufen werden. LightRAG-Logs liegen im Container unter `/tmp/lightrag.log`.
3. **Modell-Aenderungen bei LightRAG:**  
   Werden Embeddings oder Vektormodelle in LightRAG geaendert, muessen bestehende Dokumente neu indexiert werden, da Vektoren modellspezifisch sind.
