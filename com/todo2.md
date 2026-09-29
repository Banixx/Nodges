# Entwurf: todo2.md (Hierarchische Aufgaben- & Auftragsmatrix)

> **Status:** ENTWURF | **Basis:** Multi-Harness Arbeitsstand Version 0.106.35 | **Zweck:** Abloesung der alten `com/todo.md`  
> **Konzept:** Dreistufiges Modell (Thema -> Unterthema -> Konkreter Task) mit Domaenenzuweisung (`conT`, `piCon`, `dopi`) und Verlinkung in spezifische Feature-Ordner.

---

## Legende & Auftragstags (Auftragssystem)

- `[READY: conT]` = Arbeitsbereit fuer conT (Frontend, Three.js, Canvas, E2E, UI)
- `[READY: piCon]` = Arbeitsbereit fuer piCon (Container, Python, Backend, Ingestion, Linux-Tools)
- `[READY: dopi]` = Bedarf fuer dopi (Host-Docker, Compose, Startskripte, Infrastruktur)
- `[IN ARBEIT: <Harness>]` = Wird aktuell aktiv durch das genannte Harness bearbeitet
- `[BLOCKED: <Grund/Abhaengigkeit>]` = Wartet auf Vorarbeiten oder Benutzerbeschluss
- `[REVIEW: User]` = Fachlich umgesetzt; wartet auf Feedback oder Freigabe durch den Benutzer
- `[ERLEDIGT]` = Abgeschlossen

---

## 1. Thema: Workflow, Orchestrierung & Harness-Kommunikation

### 1.1 Unterthema: Neuausrichtung Task-System (Feature `todo2`)
- [x] **[ERLEDIGT]** Analyse des bisherigen Ping-Systems und Ableitung der Ineffizienzen (kein autonomes Anlaufen der Harnesses durch Pings).
- [ ] **[REVIEW: User]** Entwurf von `todo2.md` als hierarchische Arbeitsbasis freigeben. Detailkonzept: [rapport_todo2.md](file:///W:/com/feature/todo2/rapport_todo2.md).
- [ ] **[READY: conT]** Abloesung vollziehen: Umbenennung von `todo.md` -> `todo_archiv.md` und Etablierung von `todo2.md` als primaere `todo.md`.
- [ ] **[READY: piCon]** Aktualisierung der Lese- und Skill-Referenzen in `W:/.agents/skills/status/` und `AGENTS.md`.

### 1.2 Unterthema: Rueckbau & Verschlankung des COM-Ping-Busses
- [ ] **[REVIEW: User]** Grundsatzbeschluss: Rueckbau des aktiven Ping-Watchers (`watch_com.ps1`, `watch_com.mjs`, `nodges-com-watch.pid`) zugunsten rein zustandsbasierter Datei-Inspektion bei Agenten-Start.
- [ ] **[READY: piCon]** Bereinigung im Container: Deaktivierung des COM-Bus-Autostarts in `devcontainer.json` / Entrypoints; Entfernen der Pi-Erweiterung `nodges-com.ts`.
- [ ] **[READY: dopi]** Bereinigung der Docker-Compose / Host-Startskripte (`start_pi_container.cmd`), falls dort COM-Waechter aufgerufen werden.
- [ ] **[READY: conT]** Stilllegung von `tools/nodges-com.ps1` und `tools/com-bus/events.log`.

---

## 2. Thema: Wissensgraph & LightRAG (Backend & Ingestion)

### 2.1 Unterthema: Ingestion-Pipeline & Dokumenten-Verwaltung (Build 14 Stufe A)
- [x] **[ERLEDIGT]** Semantisches Absatz-Chunking, Endpunkte `POST /documents`, `GET /documents/status`, `GET /documents/list`, `DELETE /documents/{doc_id}` mit 36 Pytests.
- [ ] **[READY: piCon]** Erweiterte Fehlerbehandlung und Validierung grosser PDF-Uploads in `lightrag-backend/main.py`. Detail-Todo: [todo-feature.md](file:///W:/com/feature/build14/todo-feature.md).
- [ ] **[READY: piCon]** LightRAG Deduplizierungs-Strategie bei Re-Ingestion bestehender Textkorpora pruefen.

### 2.2 Unterthema: Graph-Slicing & Subgraph-Performance (Build 14 Stufe B)
- [x] **[ERLEDIGT]** BFS-basierte Subgraph-Extraktion ueber `get_knowledge_graph(node_label, max_depth, max_nodes)` statt Vollgraph-Slicing.
- [ ] **[READY: piCon]** Performancemessung und Cache-Layer fuer wiederkehrende Nachbarschaftsabfragen bei Grossgraphen (&gt; 5.000 Knoten).
- [ ] **[READY: conT]** Frontend-Anbindung des dynamischen Nachladens weiterer Nachbarschaftsebenen bei Klick auf Grenz-Knoten.

---

## 3. Thema: Frontend, 3D-Canvas & Spatial Literacy

### 3.1 Unterthema: 4-Kanal-Doktrin & Nodges-Manifest (Feature `test5`)
- [x] **[ERLEDIGT]** Festschreibung der 4 permanenten Kanäle (Raum, Groesse, Farbe, Dynamik) und 8 Saeulen in `com/doc/0_106_35_nodges_philosophie_synthese_und_manifest_bericht.md`.
- [ ] **[READY: conT]** Visuelle Auditierung des aktuellen 3D-Canvas: Pruefung, ob Kantenstaerken, Schriften und Farbpaletten strikt der 4-Kanal-Doktrin entsprechen.
- [ ] **[READY: conT]** Optimierung der On-Demand-Schriftanzeige (LOD / Distanz-Fading) im Three.js Render-Loop (`src/core/`).

### 3.2 Unterthema: InfoPanel & Graph-Inspektion
- [x] **[ERLEDIGT]** Edge- & Node-Inspector in `src/ui/InfoPanelUI.ts` (Quellen-Badges, Evidenz, Keywords).
- [ ] **[READY: conT]** Kontextmenue fuer gezielte Graph-Exploration (z.B. "Fokussiere Nachbarschaft", "Blende Cluster aus").

---

## 4. Thema: Test-Infrastruktur & Qualitaetssicherung

### 4.1 Unterthema: Test-Entkopplung & Tooling
- [x] **[ERLEDIGT]** Trennung `test:fast` (L0+L1+L3 im Container) und `test:all` (Host L0+L1+L2); Knip-Pruefung sauber (0 ungenutzte Dateien).
- [ ] **[READY: conT]** Ergänzung von E2E-Tests in `e2e/` fuer den Dokumenten-Upload-Workflow im Frontend.
- [ ] **[READY: piCon]** Optional: Evaluierung von `madge` im Container zur Absicherung gegen zyklische Importe in `src/core`.

---

## 5. Thema: Host-Infrastruktur & Docker (dopi-Domaene)

### 5.1 Unterthema: Container-Lifecycle & Mount-Stabilitaet
- [x] **[ERLEDIGT]** Paritaet von `docker-compose.yml` (Windows Host und WSL-Repository).
- [ ] **[READY: dopi]** Pruefung moeglicher Port-Konflikte (Vite 5173 / LightRAG 8000) und Healthcheck-Standardisierung in `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml`.
