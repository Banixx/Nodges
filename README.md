# Nodges

3D Network Visualization with Three.js.

## Entwicklung mit DevContainer

Dieses Projekt ist für die Verwendung mit [VS Code DevContainers](https://code.visualstudio.com/docs/devcontainers/containers) vorkonfiguriert.

### Voraussetzungen

1. [Docker](https://www.docker.com/products/docker-desktop/)
2. [VS Code](https://code.visualstudio.com/)
3. [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Starten

1. Öffne das Projekt in VS Code.
2. Drücke `F1` und wähle `Dev Containers: Reopen in Container`.
3. VS Code wird das Image bauen und den Container starten. Alle Abhängigkeiten (`npm install`) werden automatisch installiert.

### Befehle

- `npm run dev`: Startet den Vite-Dev-Server.
- `npm run build`: Erstellt den Production-Build.
- `npm run test`: Führt die Tests mit Vitest aus.
- `npm run test:ui`: Startet das Vitest-UI.
