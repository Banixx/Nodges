# Nodges Aufgaben- & Auftragsmatrix (todo.md)

> **Status:** AKTIV | **Basis:** Multi-Harness Arbeitsstand Version 0.106.35 | **Aktualisiert:** 2026-10-01
> **Konzept:** Dreistufiges hierarchisches Modell (Thema -> Unterthema -> Konkreter Task) mit Domaenenzuweisung (`conT`, `piCon`, `dopi`) und Verlinkung in spezifische Feature-Ordner. Fruehere flache Todo archiviert unter [todo_archiv.md](file:///W:/com/todo_archiv.md).

---

## Legende & Auftragstags (Auftragssystem)

- `[READY: conT]` = Arbeitsbereit fuer conT (Frontend, Three.js, Canvas, E2E, UI)
- `[READY: piCon]` = Arbeitsbereit fuer piCon (Python, Backend, Ingestion, L1-Tests, Linux-Tools)
- `[READY: dopi]` = Bedarf fuer dopi / Antigravity Host (Container-Erstellung, Docker, Compose, Startskripte, Infrastruktur)
- `[IN ARBEIT: <Harness>]` = Wird aktuell aktiv durch das genannte Harness bearbeitet
- `[BLOCKED: <Grund/Abhaengigkeit>]` = Wartet auf Vorarbeiten, Diskussion oder Benutzerbeschluss
- `[REVIEW: User]` = Fachlich umgesetzt; wartet auf Feedback oder Freigabe durch den Benutzer
- `[ERLEDIGT]` = Abgeschlossen

---

## 1. Thema: Workflow, Orchestrierung & Harness-Kommunikation

### 1.1 Unterthema: Neuausrichtung Task-System (Feature `todo2`)
- [x] **[ERLEDIGT]** Analyse des bisherigen Ping-Systems und Ableitung der Ineffizienzen.
- [x] **[ERLEDIGT]** Entwurf von `todo2.md` als hierarchische Arbeitsbasis durch Benutzer freigegeben (Beschluss 2026-10-01).
- [x] **[ERLEDIGT]** Abloesung vollziehen: Bisherige `todo.md` nach [todo_archiv.md](file:///W:/com/todo_archiv.md) verschoben und neues hierarchisches Auftragssystem etabliert.
- [x] **[ERLEDIGT]** Aktualisierung verbleibender Lese- und Skill-Referenzen in `W:/.agents/skills/` und `AGENTS.md`.

### 1.2 Unterthema: Bereinigung & Rueckbau aktiver Waechter / Trigger
- [x] **[ERLEDIGT]** Entfernen der COM-Bus- und Waechter-Skripte (`watch_com.ps1`, `watch_com.mjs`, `nodges-com.*`, `sync_com.ps1`, `test-com.sh`, Verzeichnis `tools/com-bus/`).
- [x] **[ERLEDIGT]** Rueckbau des `com`-Skills unter `W:/.agents/skills/com/`.
- [x] **[ERLEDIGT]** Umstellung auf rein zustandsbasierte Multi-Harness-Koordination ueber `todo.md` in `AGENTS.md`.

---

## 2. Thema: Wissensgraph & LightRAG (Backend & Ingestion)

### 2.1 Unterthema: Ingestion-Pipeline & Dokumenten-Verwaltung (Build 14 Stufe A)
- [x] **[ERLEDIGT]** Semantisches Absatz-Chunking, Endpunkte `POST /documents`, `GET /documents/status`, `GET /documents/list`, `DELETE /documents/{doc_id}` mit 36 Pytests abgesichert.
- [x] **[ERLEDIGT]** PDF-/Text-Ingestion gegen zu grosse Requests validieren: Frontend erlaubt maximal 50 MB pro Datei; Backend begrenzt extrahierten UTF-8-Text auf 50 MiB pro Request und antwortet bei Ueberschreitung mit HTTP 413. Fehlerdetails nennen Quelle und Grenzwert.
- [x] **[ERLEDIGT]** LightRAG-Deduplizierung geprueft: die installierte Pipeline dedupliziert nach Dokument-ID, Dateiname und Inhalts-Hash. `/insert` nutzt jetzt pro Inhalt einen eigenen synthetischen Quellpfad statt des gemeinsamen `insert_text.txt`, damit unterschiedliche Texte nicht faelschlich als dieselbe Datei gelten.

### 2.2 Unterthema: Graph-Slicing & Subgraph-Performance (Build 14 Stufe B)
- [x] **[ERLEDIGT]** BFS-basierte Subgraph-Extraktion ueber `get_knowledge_graph(node_label, max_depth, max_nodes)` statt Vollgraph-Slicing.
- [x] **[ERLEDIGT]** Dynamisches Nachladen von Nachbarschaftsebenen bei Klick auf Grenz-Knoten als abschaltbare Option (Toggle `dynamicNeighborExpansionEnabled`, 1-Hop-Trigger, StateManager-Merge) implementiert.

---

## 3. Thema: Frontend, 3D-Canvas & UI-Interaktion

### 3.1 Unterthema: Kognitives Leitbild & Kanal-Doktrin
- [x] **[ERLEDIGT]** 4-Kanal-Konzept mit Benutzer abgestimmt (Beschluss 2026-10-04): Das 4-Wege-Set dient als vordefiniertes Standard-Preset beim Laden im Simple-Mode; keine starre Doktrin. Vollstaendige Freiheit fuer Benutzer (UI), Datendatei-Voreinstellungen und freie Preset-Wahl gewahrt.
- [x] **[ERLEDIGT]** Optimierung der On-Demand-Schriftanzeige (LOD / Distanz-Fading) im Three.js Render-Loop: Frustum Culling, sanftes Distanz-Fading in Node- und Edge-LabelManager, GC-freie Vektornutzung im Render-Loop und On-Demand-Vorrang bei Hover/Selektion implementiert; 6/6 Unit-Tests & 8/8 E2E gruen.

### 3.2 Unterthema: Kontextmenue & Graph-Inspektion
- [x] **[ERLEDIGT]** Edge- & Node-Inspector in `src/ui/InfoPanelUI.ts` (Quellen-Badges, Evidenz, Keywords).
- [x] **[ERLEDIGT]** Kontextmenue modular ausgebaut: Modus-Betitelung (Einfach, Experte, Entwickler), kontextsensitive Aktionen fuer Node, Edge, Mehrfachauswahl und Canvas, visuelle Badges, Trennlinien und Gefahrenaktionen.

---

## 4. Thema: Test-Infrastruktur & Qualitaetssicherung

### 4.1 Unterthema: Test-Entkopplung & Tooling
- [x] **[ERLEDIGT]** Trennung `test:fast` (Container L0+L1+L3) und `test:all` (Host L0+L1+L2); Knip-Pruefung sauber (0 ungenutzte Dateien).
- [x] **[ERLEDIGT]** Ergaenzung von E2E-Tests in `e2e/05-document-upload.spec.ts` fuer den Dokumenten-Upload-Workflow im Frontend und Kontextmenue; 8/8 Playwright-Tests gruen.
- [x] **[ERLEDIGT]** Aktualisierung und Bereinigung von `.gitignore` (Syntaxfehler behoben, COM-Altlast entfernt, Python- und Build-Cache-Muster ergaenzt).
- [x] **[ERLEDIGT]** `madge` Zykluspruefung: Alle 7 zirkulaeren Abhaengigkeiten im Frontend vollstaendig entflochten (`src/core/IApp.ts` entkoppelt App von UIManager und UI-Panels; `LLMProvider` und `EmbeddingGenerator` entkoppeln LLMService und VectorStoreManager). Verifikation: `madge` meldet 0 Zyklen (`No circular dependency found`), Typecheck 0 Fehler.

---

## 5. Thema: Host-Infrastruktur & Docker (dopi-Domaene)

### 5.1 Unterthema: Container-Lifecycle & Port-Konflikte
- [x] **[ERLEDIGT]** Pruefung von Port-Konflikten (Fallback-Variablen `VITE_PORT` / `LIGHTRAG_PORT`), Bereinigung veralteter COM-Bus-Befehle und Standardisierung des Docker-Healthchecks in `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml`.
