# Walkthrough: REPO_PATH auf Windows UNC-Pfad aktualisiert

## Durchgefuehrte Aenderungen

### 1. `.env` & `.env.example`
Die Variable `REPO_PATH` wurde auf den Windows UNC-Pfad gesetzt:
* `REPO_PATH=\\wsl.localhost\Ubuntu\home\unixusername\nodges`
* `CUSTOM_PATH=/home/unixusername/.pi`

## Verifikation
* Ausfuehren von `.\start_pi_container.cmd` in PowerShell.
* Pruefen des Mounts mit `docker inspect pi-harness`.
