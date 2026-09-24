# Zusammenfassung: Git-Architektur und Branch-Status (Nodges)

## Kernaussage

Ja, sowohl dein lokales Windows-Repository als auch das Repository des Pi-Containers nutzen dasselbe GitHub-Repository (`Banixx/Nodges`) und arbeiten aktiv auf demselben Branch `pi`. Neben `pi` existiert lediglich noch der alte Referenz-Branch `main` (sowie der archivierte Feature-Branch auf GitHub).

## Architektur-Uebersicht

### 1. Das gemeinsame Zentrum: GitHub
* **Repository**: `github.com/Banixx/Nodges`
* **Aktiver Entwicklungs-Branch**: `pi` (Commit `80236c5`, Version `0.106.0`)
* **Archivierte Branches**: `main` (Stand `0.103`), `feature/multi-build` (Stand `0.102.3`)

### 2. Die beiden lokalen Arbeitsbereiche

| Eigenschaft | Windows-Host | Pi-Container (WSL2) |
|---|---|---|
| **Lokaler Pfad** | [C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges) | `/workspace` (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`) |
| **Remote-Verbindung** | `https://github.com/Banixx/Nodges.git` | `git@github.com:Banixx/Nodges.git` |
| **Aktiver Branch** | `pi` | `pi` |
| **Weiterer lokaler Branch** | `main` | `main` |
| **Aktueller Commit** | `80236c5` | `80236c5` |
| **Synchronisationsstatus** | 100% synchron mit GitHub | 100% synchron mit GitHub |

## Was bedeutet das fuer die Zusammenarbeit?

* **Einheitlicher Arbeitszweig**: Sowohl auf Windows als auch im Container wird nun standardmaessig ausschliesslich auf `pi` gearbeitet.
* **Keine verwirrenden Nebenbranches**: Alle veralteten lokalen Branches (`VersionA`, `VersionB`, `refactor/...`, Worktrees) wurden vollstaendig entfernt.
* **Synchronisation**: Neuer Code, der auf einer Seite (z.B. im Pi-Container) per `git commit` und `git push` hochgeladen wird, kann auf der anderen Seite (Windows) einfach per `git pull` uebernommen werden – und umgekehrt.
