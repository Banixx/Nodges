# Git-Vergleich: Lokaler Stand vs. Remote (Stand: Version 0.103.0)

## Uebersicht

- **Lokaler Branch**: `pi`
- **Lokaler Commit**: `1d177e5` (Version 0.103.0)
- **Lokaler Arbeitsbaum**: Sauber (`working tree clean`, keine ungesicherten Aenderungen)
- **Remote-Tracking**: `origin/pi`
- **Remote-Commit**: `d4391c0` (Version 0.105.1)
- **Status**: Der lokale Branch liegt 9 Commits hinter `origin/pi` zurueck und kann per Fast-Forward aktualisiert werden.

## Commit-Historie auf origin/pi (seit lokalem Stand 1d177e5)

1. `5b355b9` 0.103.1 von Pi
2. `91138a5` 104
3. `cfe5658` zwuetschged
4. `d8bef5b` 0.105.0
5. `2e44e67` 0.105.1
6. `346d9c2` 0.105- zueglete
7. `2b3a97b` key restriction
8. `10d6c50` LightRAG im Container, Setup-Doku aktualisiert
9. `d4391c0` 0.105.1

## Umfang der Aenderungen

- **Geaenderte Dateien**: 83
- **Zeilen hinzugefuegt**: +12.261
- **Zeilen entfernt**: -5.704

## Wichtigste Neuerungen und Modifikationen

### 1. Pi-Umgebung und Container-Setup
- Neuer Ordner `Nodges_Pi/` mit Dockerfile, `docker-compose.yml`, Setup-Skripten (`setup-pi-branch.sh`, `start_pi_container.cmd`) und eigener Dokumentation.
- Erweiterungen in `.devcontainer/` (u.a. `start-lightrag.sh`).

### 2. Frontend & Kernfunktionen
- **Minimap**: Neu implementiert unter [C:/Users/ich/Desktop/code/_projects/Nodges/src/core/MinimapManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/MinimapManager.ts).
- **SceneFactory**: Neu implementiert unter [C:/Users/ich/Desktop/code/_projects/Nodges/src/core/SceneFactory.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/SceneFactory.ts).
- **CreatePanel**: Massiv erweitert und ueberarbeitet (+765 Zeilen in [C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts)).
- **App.ts**: Refaktoriert zur Nutzung der neuen Komponenten.

### 3. LightRAG-Backend & Services
- [C:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py](file:///C:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py) und Client-Service [C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LightRAGService.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LightRAGService.ts) ueberarbeitet.
- Alte Cache- und Storage-Dateien unter `rag_storage/` wurden entfernt.

### 4. Dokumentation & Spezifikationen
- Zahlreiche neue Konzept- und Spezifikationsdokumente:
  - `vision_104.md`
  - `resetup.md`
  - `lexikon.md`
  - `anleitung_Nodges_104.txt`
  - Ordner `docs/` mit u.a. `build14-spezifikation.md`, `setup-llm-orientierung.md`, etc.
