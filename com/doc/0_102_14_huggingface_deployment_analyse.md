# Hugging Face Spaces Deployment Analyse fuer Nodges und LightRAG

## Uebersicht

Das gesamte Projekt Nodges (Frontend und LightRAG-Backend) kann auf Hugging Face Spaces gehostet werden. Hugging Face Spaces unterstuetzt Docker-Container, in denen sowohl der Python-FastAPI-Server als auch die statischen Web-Dateien des Vite-Frontends zusammen ausgefuehrt werden koennen. Alternativ kann Hugging Face ausschliesslich als Hosting-Plattform fuer das LightRAG-Backend dienen, waehrend das Frontend weiterhin auf GitHub Pages verbleibt.

## Architektur-Optionen auf Hugging Face

### Option A: Hybrid-Modell (Empfohlen)
- **Frontend:** GitHub Pages (statisch, schnelle Auslieferung via CDN).
- **Backend:** Hugging Face Space (Docker oder FastAPI SDK fuer LightRAG).
- **Vorteil:** Trennung von Benutzeroberflaeche und KI-Engine, einfache Wartung.

### Option B: Vollstaendiges Projekt in einem Docker Space
- **Docker-Container:** Ein Docker-Image baut das Vite-Frontend (`npm run build`) und fuehrt FastAPI (`lightrag-backend/main.py`) aus.
- **Nginx oder FastAPI StaticFiles:** FastAPI liefert sowohl die API-Endpunkte unter `/query` und `/insert` als auch die statischen Frontend-Dateien unter `/` aus.
- **Vorteil:** Alles in einem einzigen Dienst gehostet.

## Deployment-Ablauf von GitHub nach Hugging Face

Das Deployment erfolgt automatisiert ueber **GitHub Actions** bei jedem Push auf den `main`-Branch:

1. **Hugging Face Space erstellen:**
   - Auf Hugging Face einen neuen Space mit dem SDK `Docker` anlegen.

2. **Access Token in GitHub hinterlegen:**
   - Auf Hugging Face einen Token mit Schreibrechten (`Write`) unter *Settings -> Access Tokens* erstellen.
   - In GitHub unter *Settings -> Secrets and variables -> Actions* ein Secret namens `HF_TOKEN` anlegen.

3. **GitHub Actions Workflow konfigurieren:**
   - Eine Workflow-Datei `.github/workflows/deploy-huggingface.yml` im Repository einrichten.
   - Der Workflow klont das GitHub-Repository und pusht die Aenderungen automatisch per Git-Push in das Hugging Face Space Repository:

```yaml
name: Sync to Hugging Face Spaces

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  sync-to-hub:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Push to Hugging Face
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: |
          git push --force https://USER_NAME:$HF_TOKEN@huggingface.co/spaces/USER_NAME/SPACE_NAME main
```

4. **Automatischer Build auf Hugging Face:**
   - Sobald der Push bei Hugging Face eingeht, baut Hugging Face den Docker-Container automatisch auf ihren Servern und startet den Dienst.
