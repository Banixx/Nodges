# Erklaerung der Dateistruktur in Nodges_Pi und Container-Mounts

## Zusammenfassung

Im Ordner `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` befinden sich nur wenige Dateien und nur eine Datei im Ordner `src`, weil dieser Ordner ausschliesslich als schlanke Docker-Harness-Umgebung fuer den Pi-Agenten dient, waehrend der Container ueber Docker Compose das vollstaendige Nodges-Repository aus WSL2 (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`) als `/workspace` einbindet.

## Technische Details

### 1. Trennung zwischen Harness-Ordner und Quell-Repository
* **Harness-Ordner (`C:/Users/ich/Desktop/code/_projects/Nodges_Pi`)**:
  * Enthaelt die Docker-Konfigurationen ([docker-compose.yml](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml), [Dockerfile](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/Dockerfile)), Umgebungsvariablen ([.env](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env)) und ein urspruengliches Minimal-Setup (Starter-`package.json` und minimale `src/main.ts`).
* **Vollstaendiges Projekt (`C:/Users/ich/Desktop/code/_projects/Nodges` bzw. WSL2)**:
  * Hier befindet sich der vollstaendige Quellcode des Projekts mit allen TypeScript-Modulen, Tests, Dokumentationen und Builds.

### 2. Volume-Mount in Docker Compose
In der Datei [docker-compose.yml](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml) ist folgendes Volume definiert:

```yaml
volumes:
  - ${REPO_PATH:-.}:/workspace
```

In der zugehoerigen Konfigurationsdatei [C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env) ist `REPO_PATH` wie folgt konfiguriert:

```properties
REPO_PATH=\\wsl.localhost\Ubuntu\home\unixusername\nodges
```

### 3. Auswirkung auf den Container
* Wenn der Docker-Container `pi-harness` gestartet wird, mountet Docker nicht den Windows-Ordner `Nodges_Pi`, sondern den Pfad `\\wsl.localhost\Ubuntu\home\unixusername\nodges` direkt nach `/workspace`.
* Innerhalb des Containers steht daher das vollstaendige Nodges-Projekt zur Verfuegung.
* Der Windows-Ordner `Nodges_Pi` bleibt unveraendert ein reines Konfigurations- und Start-Verzeichnis.
