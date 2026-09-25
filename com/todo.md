# Offene Punkte

Kurz halten. Vor jeder Aufgabe lesen. Erledigtes loeschen oder nach `doc/` verschieben. Details siehe `com/doc/0_106_4_todo_abarbeitung_bericht.md`.

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

## Noch offen / Naechste Schritte

### Werkzeuge und Qualitaetssicherung
- Git-Hooks: `simple-git-hooks` oder `husky` plus `lint-staged`; Pre-Commit auf `tsc --noEmit` und Biome.
- `knip` gegen ungenutzte Dateien, Exporte und Abhaengigkeiten (93 TS-Dateien, Altlasten wie `*_5.test.ts`, `types_5.ts`).
- optional: `stats.js`-Overlay im Dev-Modus (FPS, Draw Calls, Dreiecke); `vitest bench` fuer Layout-/Physikberechnungen; `size-limit`; Renovate/Dependabot; `engines`/`.nvmrc` (Node 20 wie im CI).
- nur piCon-Ergaenzung: `madge` oder `dependency-cruiser` gegen Zyklen und Schichtverletzungen in `src/core`.

### Parallelbetrieb / Mehr-Agenten
- Vorhaben angelegt: `com/plan/0_106_4_parallele_pi_instanzen.md` (parallele pi-Instanzen im Container `pi-agent`).
  Technik geprueft und machbar; offen sind Benutzerentscheidung (Anzahl, Rollen, Variante A bis D) sowie die
  Uebernahme der Regeln (Git nur von einer Instanz, Datei-Eigentum, LightRAG nur einmal) nach `AGENTS.md`.
- Kein Anspruch aktiv. Anspruchsliste wird hier gefuehrt: `- [in Arbeit | <instanz>] <pfad oder thema>`.

### Git-Workflow (neu)
- Einheitlicher Workflow beider Harnesses: `save` (Patch + lokaler Commit, kein Push) und `release` (Minor + Tag + Push).
  Bestandsaufnahme und Vorschlag: `com/doc/0_106_5_git_workflow_vereinheitlichung.md`. Offen: fuenf Benutzerfragen in Abschnitt 4.

### Gemeinsam / unklar
- `bericht.md` Teil H.2 ueberschreibt die Werkzeugempfehlungen mit "Beschlossene Empfehlungen", in `com/entscheidungen.md` steht dazu aber nichts. Wortlaut harmonisieren oder Benutzerbeschluss einholen.
- Soll ein **`Co-authored-by`-Trailer** in Commits eingefuehrt werden, damit Banixx Repo-Owner bleibt und KI-Beitraege transparent sind? (`setup.md` Abschnitt 5).
- Kein GitHub-MCP beschlossen; fuer Issues/PRs stattdessen die `gh` CLI nutzen.
