# Nodges – Entwicklung, Build und Deployment

## 1. Entwicklung

**Voraussetzungen:**
- Node.js (CI nutzt Node 20).
- Für KI-/RAG-Funktionen optional: Python-venv (`lightrag-backend/venv`), Deno, lokal laufendes Backend.

**Dev-Server starten:**
```bash
npm install
npm run dev
```
Vite läuft auf `0.0.0.0:5173` (im Container erreichbar). Der Server bietet zusätzlich die Datei-API (Kapitel 09) und den LightRAG-Proxy.

**Skripte:** siehe `package.json` und Kapitel 02 (`npm test`, `test:ui`, `test:coverage`, `build`, `gen:data`, `export:schema`, `lightrag`).

## 2. Build

```bash
npm run build
```
Führt `tsc` (Typprüfung) und `vite build` aus. Ausgabe: `dist/` (mit `sourcemap`, `manifest`, `emptyOutDir`).

## 3. Umgebungsvariablen / Konfiguration

- `.env.example` dokumentiert verfügbare Variablen; `.env` wird nicht eingecheckt.
- Relevante Variablen (aus Code-Analyse):
  - `VITE_OPENROUTER_API_KEY`, `VITE_OPENAI_API_KEY`, `VITE_ANTHROPIC_API_KEY` – LLM-Keys (Frontend).
  - `VITE_LIGHTRAG_PROXY_TARGET` – Zielfeld des LightRAG-Proxys (Default `http://host.docker.internal:8000`).

## 4. CI/CD: GitHub Actions

`.github/workflows/deploy.yml` („Deploy Vite to Pages"):

- Trigger: Push auf `main` oder manuell (`workflow_dispatch`).
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- **Build-Job:** checkout, `setup-node` (Node 20), `npm ci`, `npm run build --if-present`, `upload-pages-artifact` mit Pfad `./dist`.
- **Deploy-Job:** nutzt `actions/deploy-pages@v4`, GitHub-Pages-Umgebung mit Seiten-URL.

→ Das Projekt wird nach jedem Haupt-Branch-Push automatisch auf GitHub Pages veröffentlicht (`https://banixx.github.io`).

## 5. Deployment-Hinweise

- `base: './'` erlaubt relative Pfade, sodass der Build unter einem GitHub-Pages-Unterpfad funktioniert.
- Der Deno-Proxy erlaubt als Origin ausdrücklich `https://banixx.github.io` (siehe Kapitel 11).
- `npm run preview` testet den gebauten `dist/`-Ordner lokal.

## 6. Git-Workflow und Branches

- Remote: `git@github.com:Banixx/Nodges.git`.
- Branches: `main` (Deploy-Ziel), `pi` (aktiver Entwicklungsbranch in dieser Umgebung), `feature/multi-build`; origin/HEAD → `main`.
- Versions-Kommit-Tags im Log (z. B. `0.103.1 von Pi`, `0.103`, `0.102.15` usw.).

## 7. Bewertung

**Positiv:**
- Automatisiertes CI/CD zu GitHub Pages.
- Relative Basis-Pfade und dedupliziertes Three.js erleichtern das Hosting.
- Dev-Server mit eingebauter API ist praktisch für reine Frontend-Prototypen.

**Schwächen:**
- Kein Test-Job im CI-Pipeline (nur Build); Coverage wird nicht veröffentlicht.
- Ohne echtes Backend im Produktionsmodus funktionieren Speichern/Datenbanken nur eingeschränkt (Dev-API fehlt in `dist/`).
- `.env` liegt im Workspace; Keys könnten versehentlich eingecheckt werden (`.gitignore` beachten).

---

*Weiter: `/workspace/com/doc/13_tests_qualitaet_nodges_V4.md`.*
