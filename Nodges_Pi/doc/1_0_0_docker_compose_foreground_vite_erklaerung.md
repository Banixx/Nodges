# Erklaerung der Live-Konsole nach `docker compose up`

## Was auf dem Bildschirm zu sehen ist

1. **Gekoppeltes Terminal (Foreground Output)**:
   - Der Befehl `docker compose up` wurde ohne den Zusatz `-d` (Detached Mode) aufgerufen. Dadurch bleibt das Terminal direkt mit dem Container `pi-harness` verbunden.

2. **Vite Development Server**:
   - Im Container laeuft der Start-Befehl `command: npm run dev` aus der `docker-compose.yml`.
   - Dieser startet den Vite Entwicklungs-Server. Die Webanwendung ist nun lokal unter [http://localhost:5173/](http://localhost:5173/) erreichbar.

## Nützliche Optionen

- **Aushaengen (Detach)**:
  - Druecken Sie die Taste `d` in der Konsole. Das Terminal wird freigegeben, und der Container laeuft im Hintergrund weiter.
- **Pi-Agent starten**:
  - Oeffnen Sie ein zweites Terminal und fuehren Sie folgenden Befehl aus:
    ```bash
    docker compose exec -it pi-agent pi
    ```
