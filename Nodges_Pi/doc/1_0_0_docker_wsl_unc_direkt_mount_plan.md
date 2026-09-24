# Implementierungsplan: Direktes Mounten des geklonten WSL-Ordners (ohne Worktree)

## Uebersicht
Das Repository ist direkt unter `\\wsl.localhost\Ubuntu\home\unixusername\nodges` in WSL2 geklont und enthaelt die `package.json`. Es werden keine Git Worktrees verwendet.

Fuer die korrekte Erkennung des UNC-Pfades in Docker Compose unter Windows muss `REPO_PATH` in C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env mit Backslashes angegeben werden:
`REPO_PATH=\\wsl.localhost\Ubuntu\home\unixusername\nodges`

## Aenderungen an den Dateien

### 1. `.env` & `.env.example`
`REPO_PATH` auf den exakten UNC-Pfad `\\wsl.localhost\Ubuntu\home\unixusername\nodges` setzen.

## Verifikation
* Ausfuehren von `.\start_pi_container.cmd` in PowerShell.
* Pruefen mit `docker inspect pi-harness` und `docker compose logs pi-agent`, dass `/workspace` vollstaendig befuellt ist und der Container laeuft.
