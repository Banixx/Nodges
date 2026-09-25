# Bericht: Abarbeitung der offenen Punkte aus todo.md

**Projekt:** Nodges (Three.js 3D Network Visualization)  
**Version:** 0.106.4  
**Datum:** 2026-09-25  
**Autor:** conT (Antigravity auf Laufwerk W:/)  
**Status:** Erfolgreich abgeschlossen  

---

## 1. Zusammenfassung

In diesem Durchlauf wurden die offenen Punkte aus [W:/com/todo.md](file:///W:/com/todo.md) systematisch analysiert, umgesetzt und verifiziert. Alle Kernblocker sowie die priorisierten Massnahmen fuer Test-Infrastruktur, Tooling, Codequalitaet und Datei-Hygiene sind nun produktiv eingerichtet.

---

## 2. Durchgefuehrte Massnahmen im Detail

### 2.1 Paket- und Playwright-Integritaet
- **`@playwright/test`**: Das in `package.json` deklarierte, aber bisher fehlende Paket wurde in `node_modules` und `package-lock.json` installiert.
- **Browser-Downloads im Container**: Der Download von Chromium fuer Playwright im Container scheiterte zunaechst an `ENOSPC`, da die Container-Laufzeit `/tmp` als 100-MB-tmpfs begrenzt hat. Durch Umleitung auf ein temporaeres Verzeichnis auf dem Hauptdateisystem (`TMPDIR=/home/.pi/tmp`) wurden Chromium, FFmpeg und die Headless Shell erfolgreich heruntergeladen.

### 2.2 Continuous Integration (CI-Gate)
- **Workflow [W:/.github/workflows/verify.yml](file:///W:/.github/workflows/verify.yml)** neu angelegt:
  - Trigger: Push auf `main` sowie alle Pull Requests.
  - Pipeline: `npm ci` -> `npm run typecheck` -> `npm run lint` -> `npm test -- --run` -> `npx playwright install --with-deps chromium` -> `npm run test:e2e` -> `npm run build`.
  - Stellt sicher, dass Code-Regressionen oder brechende Tests ein fehlerhaftes Release auf GitHub Pages verhindern.

### 2.3 Typ-Sicherheit & Konfiguration
- **Typecheck-Script**: `"typecheck": "tsc --noEmit"` in [W:/package.json](file:///W:/package.json) ergaenzt.
- **E2E & Playwright-Typisierung**: [W:/tsconfig.json](file:///W:/tsconfig.json) erweitert um `e2e/**/*.ts` und `playwright.config.ts`.
- **Verifikation**: `tsc --noEmit` validiert die gesamte Codebasis inklusive aller E2E-Suiten fehlerfrei (Exit-Code 0).

### 2.4 Linter & Formatter (Biome)
- **Biome eingerichtet**: `@biomejs/biome` als schneller, einheitlicher Linter und Formatter installiert.
- **Konfiguration [W:/biome.json](file:///W:/biome.json)**:
  - 4 Spaces Einrueckung, Single Quotes, Semikolons, Line-Width 120 Zeichen.
  - Pragmatische Regelsaetze fuer Three.js und graphische Datenstrukturen.
- **NPM-Scripts**: `"lint": "biome lint ."` und `"format": "biome format --write ."` in `package.json` hinzugefuegt.
- **Ergebnis**: Alle 97 Quellcodedateien werden in unter 400 Millisekunden geprueft; der Linter laeuft ohne Fehler durch.

### 2.5 Datei- und Zeilenenden-Standards (.editorconfig & UTF-8)
- **[W:/.editorconfig](file:///W:/.editorconfig)** angelegt:
  - Erzwingt UTF-8, 4 Leerzeichen Einrueckung und LF-Zeilenenden repo-weit.
  - Explizite Ausnahme fuer Windows-Skripte (`*.cmd`, `*.bat`, `*.ps1`) mit CRLF gemaess den Projektrichtlinien aus `AGENTS.md`.
- **Encoding-Korrektur**: `src/index.css` wurde von Windows-spezifischem UTF-16LE in standardkonformes UTF-8 ohne BOM konvertiert.

### 2.6 Test-Framework Harmonisierung (Vitest & DOM)
- In [W:/src/tests/ImportManager.test.ts](file:///W:/src/tests/ImportManager.test.ts) wurde der manuelle JSDOM-Import mit `@ts-ignore` entfernt und durch die standardisierte Vitest-Direktive `// @vitest-environment jsdom` ersetzt.
- In [W:/src/tests/SelectionHandler.test.ts](file:///W:/src/tests/SelectionHandler.test.ts) wurde die Umgebung auf `happy-dom` umgestellt.
- **Testergebnis**: Alle 238 Unit-Tests ueber 19 Testdateien laufen vollstaendig erfolgreich durch.

### 2.7 Coverage & Bundle-Analyse
- **Coverage-Thresholds**: In [W:/vitest.config.ts](file:///W:/vitest.config.ts) wurden Baseline-Schwellenwerte (`lines: 15`, `functions: 20`, `branches: 25`, `statements: 15`) sowie die Begrenzung auf `src/**/*.ts` hinterlegt.
- **Rollup Plugin Visualizer**: `rollup-plugin-visualizer` installiert und in [W:/vite.config.ts](file:///W:/vite.config.ts) eingebunden. Erzeugt bei `npm run build` automatisch einen interaktiven Report unter [W:/dist/stats.html](file:///W:/dist/stats.html).

### 2.8 Harmonisierung und Datei-Hygiene
- **`.gitignore`**: Erweitert um `coverage/`, `playwright-report/` und `test-results/`.
- **Tote Skripte**: Veralteter Eintrag `"gen:data"` (zielend auf nicht existentes `scripts/generate-test-data.cjs`) aus `package.json` geloescht.
- **Docker-Compose**: SHA-256-Abgleich bestaetigt 100 % Identitaet zwischen Windows (`C:/Users/ich/...`) und Repository (`W:/Nodges_Pi/docker-compose.yml`).
- **Branch-Status**: Lokaler Branch `pi` existiert weder auf `W:/` noch im Container; es wird ausschliesslich auf `main` gearbeitet.
- **LightRAG Storage Backup**: Skript [W:/lightrag-backend/backup_storage.sh](file:///W:/lightrag-backend/backup_storage.sh) implementiert und erfolgreich getestet (Archivierung nach `backups/`).

---

## 3. Pruefmatrix

| Komponente | Pruefbefehl | Resultat |
|---|---|---|
| TypeScript Typecheck | `tsc --noEmit` | Erfolgreich (0 Fehler, inkl. E2E) |
| Linter | `npm run lint` | Erfolgreich (0 Fehler) |
| Unit-Tests | `npm test -- --run` | 238 bestanden, 3 uebersprungen |
| Produktions-Build | `npm run build` | Erfolgreich, `dist/stats.html` erzeugt |
| RAG Storage Backup | `bash lightrag-backend/backup_storage.sh` | Erfolgreich (1.2 MB Archiv in `backups/`) |
