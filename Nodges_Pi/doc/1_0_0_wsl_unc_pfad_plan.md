# Implementierungsplan: WSL2 UNC-Pfad fuer REPO_PATH in .env

## Uebersicht
Der Workspace im Container soll auf den WSL2 UNC-Pfad `\\wsl.localhost\Ubuntu\home\unixusername\nodges` (bzw. `//wsl.localhost/Ubuntu/home/unixusername/nodges`) verweisen.

## Aenderungen an den Dateien

### 1. `.env` & `.env.example`
`REPO_PATH` wird auf den UNC-Pfad `//wsl.localhost/Ubuntu/home/unixusername/nodges` (oder `\\wsl.localhost\Ubuntu\home\unixusername\nodges`) aktualisiert.

## Verifikation
* Ausfuehren von `.\start_pi_container.cmd` in PowerShell.
* Pruefen des Mounts mit `docker inspect pi-harness`, um sicherzustellen, dass `/workspace` korrekt auf den WSL2 UNC-Pfad verweist.
