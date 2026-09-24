# Initiales Herunterladen bei `docker compose up -d`

## Warum werden beim ersten Start viele Dateien heruntergeladen?

Beim erstmaligen Aufruf von `docker compose up -d` (bzw. `--build`) laeuft ein mehrstufiger Einrichtungsprozess ab:

1. **Download des Base-Images (Docker Registry)**:
   - Docker laedt das in der `Dockerfile` definierte Basis-Image (`node:22-slim`) herunter.
   - Dieses Image besteht aus mehreren komprimierten Schichten (Layern), die einzeln heruntergeladen und entpackt werden.

2. **Installation von Systempaketen**:
   - Die im `Dockerfile` enthaltenen `RUN`-Befehle laden weitere erforderliche Pakete ueber den Paketmanager herunter:
     - Python 3, Pip und venv
     - Git
     - Build-Tools (`build-essential`)
     - Curl

3. **Globales NPM-Paket**:
   - Zudem wird der Pi Coding Agent (`@earendil-works/pi-coding-agent`) ueber `npm` heruntergeladen und global installiert.

## Speicherung im lokalen Cache

Sobald dieser Download einmalig abgeschlossen ist, speichert Docker das erstellte Image lokal auf Ihrem Rechner. 

Bei spaeteren Aufrufen von `docker compose up -d` oder `docker compose start` wird auf diesen lokalen Cache zugegriffen. Ein erneuter Download findet nicht mehr statt, sodass der Start innerhalb von Sekunden erfolgt.
