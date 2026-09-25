# Status: Live-Dev-Version Erreichbarkeit

## 1. Erreichbarkeit und Status
- **URL:** `http://localhost:5173`
- **HTTP-Status:** 200 OK
- **Server:** Vite Dev-Server aus Container `pi-harness` (Port 5173 gemappt auf Host `0.0.0.0:5173`).
- **Skripte:** `/src/App.ts` und Vite-Client (`/@vite/client`) werden fehlerfrei mit JavaScript-MIME-Type ausgeliefert.

## 2. API- und Backend-Dienste
- **Graph-APIs:** `/api/list_files` antwortet mit der vollstaendigen Liste der JSON-Graphen.
- **LightRAG-Proxy:** `/lightrag-api/health` meldet `online` (Engine aktiv, Port 8000 via Proxy erreichbar).

## 3. Anzeigeumgebung
- **Fuer den Benutzer:** Direkt im Windows-Browser unter `http://localhost:5173` sichtbar und bedienbar.
- **Im Container (Headless):** Chrome CDP (Port 9222) und noVNC (Port 6080) sind gemaess AGENTS.md inaktiv (Pakete im Docker-Image fehlen).
