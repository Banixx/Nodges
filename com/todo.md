# Offene Punkte

Kurz halten. Vor jeder Aufgabe lesen. Erledigtes loeschen oder nach `doc/` verschieben. Details siehe `com/doc/0_106_4_todo_abarbeitung_bericht.md`.

## Offen (2026-09-28)

- **Loeschfreigabe einholen (piCon):** `/home/.pi/agent/user.md` (abgeloeste Profilkopie) und `/home/.pi/agent/skills/{com,release,save,status}/` (uebersprungene Skill-Doppelungen). Beides ausserhalb des Repos. Details siehe `com/doc/0_106_32_agents_md_bereinigung_bericht.md`.

## Erledigt in 0.106.4 (2026-09-25)

- **`@playwright/test` & Browser**: Installiert in `node_modules`; Chromium, FFmpeg und Headless-Shell im Container via `TMPDIR` installiert.
- **CI-Gate**: Workflow `.github/workflows/verify.yml` angelegt (Typecheck, Biome Linting, Vitest, Playwright, Build).
- **Typecheck & Typ-Integritaet**: Script `"typecheck": "tsc --noEmit"` in `package.json` hinterlegt; `tsconfig.json` um `e2e` und `playwright.config.ts` erweitert; fehlerfrei validiert.
- **Linter & Formatter**: Biome eingerichtet (`biome.json`, Scripts `lint` und `format` in `package.json`).
- **`.editorconfig`**: Angelegt mit 4 Spaces, LF und CRLF-Ausnahme fuer Windows-Skripte.
- **`.gitignore`**: Erweitert um `coverage/`, `playwright-report/`, `test-results/`.
- **Bereinigung**: Veralteter Eintrag `"gen:data"` aus `package.json` entfernt.
- **Encoding**: `src/index.css` von UTF-16LE nach UTF-8 konvertiert.
- **Test-Harmonisierung**: `ImportManager.test.ts` auf sauberes `// @vitest-environment jsdom` umgestellt; alle 238 Unit-Tests laufen gruen.
- **Coverage-Thresholds**: In `vitest.config.ts` definiert.
- **Bundle-Analyse**: `rollup-plugin-visualizer` integriert; erzeugt `dist/stats.html`.
- **Harmonisierung docker-compose.yml**: Verifiziert; Datei auf Windows und Snapshot im Repo sind SHA-256-identisch.
- **Branch-Bereinigung**: Lokaler Branch `pi` existiert weder auf `W:/` noch im Container; nur `main` ist aktiv.
- **LightRAG Storage Backup**: Skript `lightrag-backend/backup_storage.sh` angelegt und erfolgreich verifiziert.

## Erledigt in 0.106.8 (2026-09-27)

- **Multi-Harness Ping-Pong Evaluation**: 5 Runden Ping-Pong zwischen conT und piCon in `com/test/rapport_pingpong.md` erfolgreich abgeschlossen.
- **Benutzerbeschluesse umgesetzt**:
  - Domaenenzustaendigkeiten (conT: `src/`, `e2e/`; piCon: `lightrag-backend/`, `tools/`) verbindlich in `AGENTS.md` verankert.
  - Dokumentenrangfolge (`entscheidungen.md` > `plan/` > `todo.md`) und Frage-Modus-Ausnahme in `AGENTS.md` kodifiziert.
  - Benutzerprofil (Banixx, Amateurprogrammierer, "ç"-Trigger) als Single Source of Truth direkt in `AGENTS.md` integriert; keine separate `user.md` erforderlich.
  - Testketten in `package.json` entkoppelt: `"test:fast"` fuer Container (L0+L1+L3) und `"test:all"` fuer Host (L0+L1+L2).
  - Schutz vor unabsichtlichem Staging: `tools/nodges-git.sh save` zeigt vor dem Commit `git status --short` an.
  - Pfad-Drift bereinigt: `tools/com-bus/piCon.seen` in `AGENTS.md`.

## Noch offen / Naechste Schritte

- **Hinweis:** Aktuelle Feature‑Entwicklungen finden Sie im Verzeichnis `W:/com/feature/` bzw. `//wsl.localhost/Ubuntu/home/unixusername/nodges/com/feature` (WSL‑Pfad).

### Aktive Features (Multi-Harness)
- **Aktiv (Feature `test5`):** Philosophie von Nodges (Multi-Harness conT & piCon): Kognitionspsychologisches Leitbild (Spatial Literacy, Cognitive Offloading, 7 Dimensionen, Neurodiversitaet, Metaphern) und Systemphilosophie (Local-First, Schema-Stabilitaet, SSoT ext4, COM-Bus). Dashboard: `com/feature/test5/dashboard.md` bzw. `dashboard.html`. Rapport: `com/feature/test5/rapport_test5.md`. Pong 1 (piCon) erledigt; Bericht: `com/doc/0_106_23_test5_pong1_bericht.md`. Runde 2 (Synthese/Manifest) wartet auf conT.

### Werkzeuge und Qualitaetssicherung
- **Erledigt (conT, Single Harness):** Test-Infrastruktur Harmonisierung: Dashboard auf einer Bildschirmseite eingerichtet (Name, Beschreibung, Ziele, Fortschritt 100%). L1-Laufzeit geklaert: Vitest verbleibt verbindlich im Linux-Container; keine Windows-Binaries im ext4 node_modules; Domaenenteilung (L0/L2 auf Host, L1/L3 im Container) verifiziert. Dashboard: `com/feature/test_infrastruktur/dashboard.md` bzw. `dashboard.html`. Rapport: `com/feature/test_infrastruktur/rapport_test_infrastruktur.md`.
- **Erledigt (conT):** `.nvmrc` auf Node 20 fixiert, `"engines": { "node": ">=20.0.0" }` in `package.json` hinterlegt (Paritaet mit CI-Workflow).
- **Erledigt (conT):** `knip` installiert (`knip.json`, Skript `"knip"` in `package.json`) und durchgefuehrt: 0 ungenutzte Quelldateien im gesamten Projekt `src/`.
- **Erledigt (Feature `git_hooks`):** Git-Hooks (pre-commit, pre-push, post-commit) konfiguriert und repo-weit aktiviert. Push-Restriktion gemaess Beschluss: GitHub-Push ausschliesslich bei Major-Versionen (`X.0.0`) nach expliziter Rueckfrage an den Benutzer (`--bestaetigt-durch-user`). Minor-Releases (`release`, Ziffer 2) nur nach vorheriger Ruecksprache mit dem Benutzer (`--bestaetigt-durch-user`). Patch-Releases (`save`, Ziffer 3) erfolgen selbststaendig. Dashboard: `com/feature/git_hooks/dashboard.md` bzw. `dashboard.html`. Rapport: `com/feature/git_hooks/rapport_git_hooks.md`.
- **Erledigt (conT):** Text-Export-Archiv `com/txt/`: Vollstaendige Generierung von 28 Textdokumenten (.txt) inklusive synthetisierter Gesamtschau (`00_GESAMTSCHAU_NODGES_UEBERBLICK.txt`), Katalog (`INDEX_DATEIEN.txt`), All-in-One-Monolith (`NODGES_GESAMTBAND_ALL_IN_ONE.txt`, 430 KB) sowie aller zentralen Steuerungsdateien, Arbeitspapiere und der 12 neuesten Feature-Berichte/Dashboards.
- optional: `stats.js`-Overlay im Dev-Modus (FPS, Draw Calls, Dreiecke); `vitest bench` fuer Layout-/Physikberechnungen; `size-limit`; Renovate/Dependabot.
- nur piCon-Ergaenzung: `madge` oder `dependency-cruiser` gegen Zyklen und Schichtverletzungen in `src/core`.

### Parallelbetrieb / Mehr-Agenten
- **Entschieden (2026-09-27, F-04 Option A):** Es bleibt verbindlich bei einer einzigen Pi-Instanz (`piCon`). Kein Parallelbetrieb im Container noetig (`com/feature/0_106_4_parallele_pi_instanzen.md` abgeschlossen).
  - `- [erledigt | conT, piCon, dopi] Autostart und Persistenz des COM-Bus-Waechters im Container (Tri-Harness, 3 Runden abgeschlossen). Rapport: com/feature/autostart_com_bus/rapport_autostart_com_bus.md. Runde 3 erfolgreich: Container-Neustart verifiziert, Waechter (PID 49) laeuft automatisch, Single-Instance und Inotify bestaetigt, Freigabe erteilt.`

### Git-Workflow (neu, umgesetzt in 0.106.5)
- Eingefuehrt: `tools/nodges-git.sh` mit `save` (Patch + lokaler Commit, kein Push), `release` (Minor + Tag + Push)
  und `status` (Standbericht statt Pull). Versionierte Hooks in `git-hooks/`, aktiv ueber `core.hooksPath`.
- conT liest Workspace-Skills aus `W:/.agents/skills/<name>/SKILL.md`; dort liegen `save`, `release`, `status`
  versioniert. piCon spiegelt sie unter `/home/.pi/agent/skills/`; `uupdate` bleibt Alt-Name fuer `save`.
- Dokumentation: `com/doc/0_106_5_git_workflow_vereinheitlichung.md` (Abschnitt 6 = Umsetzung).
- Noch zu pruefen im Betrieb: greifen die Hooks auch auf der **Windows-Seite** (`core.hooksPath` relativ)?
  Falls dort nicht aufloesbar, laufen die Hooks bei conT stillschweigend nicht (Git bricht nicht ab).
- **Erledigt (2026-09-27, F-01 Option A):** `tools/nodges-git.sh` haengt in `save` und `release` einen
  `Harness: conT` / `Harness: piCon`-Trailer an. Erkannt per `NODGES_HARNESS` oder Betriebssystem.
- **Erledigt (2026-09-27, F-02 Option A):** `release` erzwingt E2E nur auf conT (Windows); im Container
  uebersprungen, steuerbar per `NODGES_SKIP_E2E=1` / `NODGES_FORCE_E2E=1`.

### Build 14 - LightRAG (Stand 27.09.2026)
- **Backend erledigt (piCon):** `lightrag-backend/main.py` liefert jetzt Query-Teilgraphen (Seeds per
  `entities_vdb.query`, dann BFS ueber `get_knowledge_graph(node_label, max_depth, max_nodes)`)
  statt Vollgraph-Hardslicing; Kanten/Knoten als standardisiertes DTO (`weight`, `keywords`,
  `description`, `sources`), live verifiziert. Siehe `com/feature/build14/rapport_build14.md` Abschnitt 6.
- **Backend-Tests erweitert (piCon, 27.09.2026):** `lightrag-backend/tests/test_api.py` jetzt 27 Tests gruen
  (neu: `create`/`select`/`delete` der Datenbank-Endpunkte sowie Pfad-Traversal-Schutz, mit isolierten
  tmp-Verzeichnissen und deaktivierter Engine). Ohne API-Kosten. Siehe
  `com/feature/Test_Setup_Plan/rapport_test_setup.md` Abschnitt 11.
- **Erledigt (conT):** Skript `test:backend` in `package.json` hinterlegt und erfolgreich verifiziert (27 Tests gruen).
- **Erledigt (conT):** Frontend-Mapping der neuen DTO-Felder in `src/utils/LightRAGService.ts` (`weight`, `keywords`, `description`, `sources`), Kantenexpansion, Schema 5.2 Visual Mappings und `CreatePanel.ts` Pipeline-Anbindung.
- **Erledigt (conT):** Edge- & Node-Inspector in `src/ui/InfoPanelUI.ts` (hervorgehobene Text-Evidenz, Quellen-Badges, Keywords) und Tooltips in `src/ui/HoverInfoPanel.ts`.
- **Erledigt (conT):** One-Page Dashboards (`dashboard.md` und `dashboard.html`) in `com/feature/build14/` eingerichtet.
- **Erledigt (conT):** Ausfuehrlicher Ergebnisbericht `com/doc/0_106_13_build14_dashboard_und_tooling_bericht.md` erstellt; Berichtspflicht in `AGENTS.md` und `com/entscheidungen.md` verbindlich verankert.
- **Erledigt (2026-09-27, F-02 Option A):** `release` erzwingt `npm run test:e2e` nur auf dem Windows-Host
  (conT). Im Container (piCon) wird E2E uebersprungen, weil Chromium an fehlenden Systembibliotheken
  (`libglib-2.0.so.0`) scheitert. Steuerung: `NODGES_SKIP_E2E=1` / `NODGES_FORCE_E2E=1`.
- **Erledigt (piCon, 27.09.2026):** `app.on_event("startup")` in `main.py` auf einen Lifespan-Handler
  (`asynccontextmanager`) umgestellt; die DeprecationWarning ist damit weg (Import mit
  `-W error::DeprecationWarning` geprueft).

### Gemeinsam / unklar
- **Erledigt (2026-09-27, F-03):** Veraltete Root-Dateien `resetup.md` und `Plan_v4_Nodges_Diagnose_Refactoring.md` geloescht.
- **Erledigt (2026-09-27, F-04 Option A):** Single-Instance-Betrieb fuer Pi-Agenten beschlossen.
- **Erledigt (2026-09-27, F-05 Option A):** Harmonisierung Werkzeugempfehlungen: Empfehlungen aus Berichten gelten als Vorschlaege, solange sie nicht in `com/entscheidungen.md` stehen.
- **Erledigt (2026-09-27, F-01 Option A):** Kein `Co-authored-by`-Trailer; stattdessen der Harness-Trailer
  `Harness: conT` / `Harness: piCon` in `tools/nodges-git.sh`. Banixx bleibt Autor/Committer.
- Kein GitHub-MCP beschlossen; fuer Issues/PRs stattdessen die `gh` CLI nutzen.
