# Knip Dead-Code- und Abhaengigkeitsanalyse

Dokumentenversion: 0.105.2
Ausfuehrung: Google Antigravity (Gemini Flash)
Datum: 2026-09-22

---

## 1. Ueberblick

Mit `npx --yes knip --no-exit-code` wurde eine vollstaendige statische Analyse der Codebasis durchgefuehrt, um ungenutzte Dateien, Abhaengigkeiten und Exporte zu identifizieren.

---

## 2. Ergebnisse

### 2.1 Unbenutzte Dateien
1. `deno-proxy/index.ts`: Veralteter Deno-Proxy-Versuch.
2. `Nodges_Pi/src/main.ts`: Git-Snapshot des Pi-Containers.
3. `Nodges_Pi/vite.config.ts`: Git-Snapshot des Pi-Containers.
4. `src/workers/layout-worker.js`: Kompilierte/historische JS-Worker-Datei (Projekt nutzt TS-Worker).

### 2.2 Unbenutzte Dependencies (package.json)
1. `lil-gui`: Wurde frueher fuer GUI-Controls genutzt; das aktuelle UI basiert weitgehend auf Vanilla-HTML-Panels in `index.html` und `src/ui/`.
2. `@testing-library/dom`: In `devDependencies`, wird derzeit in Vitest-Dateien nicht importiert.

### 2.3 Unbenutzte Exporte (Auswahl)
- `collectPaths` (`src/core/BuildFormatUtils.ts:73`)
- `normalizeRelationToSet` (`src/core/DataParser.ts:513`)
- `NotificationService` (Klasse in `src/core/NotificationService.ts`, nur Funktion `notify` exportiert/genutzt)
- `getCachedEmbedding` (`src/utils/VectorStoreManager.ts:27`)
- Diverse Typ- und Zod-Schema-Exporte in `src/types.ts`.

---

## 3. Empfohlene Massnahmen fuer das Refactoring

1. **Dateibereinigung:** `deno-proxy/` und `src/workers/layout-worker.js` koennen in Phase 4 sicher archiviert/entfernt werden.
2. **Dependency-Audit:** Pruefen, ob `lil-gui` noch fuer das Debug-Panel benoetigt wird; falls nicht, aus `package.json` deinstallieren.
3. **Export-Cleanup:** Unnoetige Exporte koennen privatisiert oder im Zuge der Schichtentrennung zusammengefuehrt werden.
