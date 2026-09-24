# Grund fuer "Empty log" und Warterad bei "docker compose up -d --build"

Wenn beim Ausfuehren von `docker compose up -d --build` in Antigravity die Meldung **"Empty log"** zusammen mit einem Ladezeichen (Warterad) erscheint, liegt das meist an folgenden Faktoren:

## Ursachen

1. **Pufferung des Ausgabestroms (Output Buffering)**:
   - Während des Docker-Builds (z. B. beim Herunterladen von Base-Images wie `node:22-slim` oder beim Ausfuehren von `apt-get`) werden Log-Zeilen erst nach dem Leeren des Puffers (Flush) an die Benutzeroberflaeche uebertragen.
   - Solange keine vollstaendige Zeile im Puffer ist, zeigt die Log-Anzeige voruebergehend "Empty log" an.

2. **Laengere Build-Dauer**:
   - Das Erstellen des Docker-Containers sowie die Installation von System-Paketen und NPM-Paketen benoetigt einige Zeit. Der Prozess laeuft im Hintergrund weiter, waehrend das Warterad die aktive Ausfuehrung anzeigt.

3. **Warten auf Docker Desktop / Dämon**:
   - Wenn Docker Desktop noch initialisiert wird oder auf Berechtigungen unter Windows wartet, blockiert der Prozess, bis der Docker-Dienst antwortet.

## Abhilfe und Pruefung

- Warten Sie, bis der Build-Schritt erste Log-Zeilen ausgibt.
- Sie koennen den Container-Status auf Systemebene auch separat ueber `docker compose ps` oder `docker ps` in einem externen Terminal pruefen.
