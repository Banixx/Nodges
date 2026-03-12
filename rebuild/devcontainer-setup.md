---
description: Automatisiertes Erstellen der DevContainer-Umgebung für ein Projekt
---

# DevContainer Setup Workflow

Wenn der Benutzer diesen Workflow aufruft, möchtest du das aktuelle Projekt für die Nutzung in einem Docker-DevContainer aufrüsten.

Bitte befolge strikt diese Schritte:

1. Analysiere das Projektverzeichnis im aktuellen Workspace, um die Haupt-Programmiersprache und etwaige Abhängigkeiten herauszufinden (z.B. requirements.txt oder package.json).
2. Erstelle einen `.devcontainer`-Ordner im Root des aktuellen Projekts.
3. Erzeuge darin eine Datei `Dockerfile`. Nutze als Basis-Image, wenn möglich, eine NVIDIA/CUDA-Basis (falls GPU benötigt wird) oder ein passendes Standard-Image (z.B. `mcr.microsoft.com/devcontainers/python` oder `node`), je nach Projekt-Art.
   **Wichtig:** Füge im Dockerfile vor dem ersten `apt-get update` stets den Befehl `RUN rm -f /etc/apt/sources.list.d/yarn.list` ein, um GPG-Fehler beim Build-Prozess durch abgelaufene Keys zu vermeiden.
4. Erzeuge darin eine Datei `docker-compose.yml`, die das Dockerfile baut und notwendige GPU-Ressourcen oder Mounts bereitstellt (wie z.B. `- ../:/workspace:cached`).
5. Erzeuge eine `devcontainer.json`, welche die notwendigen VS Code Extensions, das `runArgs` für die GPU (`--gpus all`) und die `workspaceFolder` Konfiguration enthält.
6. Sobald alle 3 Dateien fertiggestellt sind, weise den Benutzer freundlich an:
   "Das DevContainer-Setup ist fertig. Bitte drücke nun `Strg+Umschalt+P` und wähle **'Dev Containers: Rebuild and Reopen in Container'**, um dort weiterzuarbeiten. Starten wir danach dort einen neuen Chat!"
7. Schreibe keinen weiteren Projekt-Code auf dem aktuellen Host-System!
