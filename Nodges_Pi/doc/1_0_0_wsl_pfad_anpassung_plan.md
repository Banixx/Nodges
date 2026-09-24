# Implementierungsplan: WSL2-Pfade anpassen (/home/unixusername/nodges)

## Uebersicht
Der WSL-Benutzer lautet `unixusername` und das Zielverzeichnis in WSL2 lautet `~/nodges` (entspricht `/home/unixusername/nodges`). Die Pfade in den Konfigurationsdateien und Setup-Skripten werden auf dieses Verzeichnis angepasst.

## Aenderungen an den Dateien

### 1. `.env` & `.env.example`
* `REPO_PATH` auf `/home/unixusername/nodges` setzen.
* `CUSTOM_PATH` auf `/home/unixusername/.pi` (oder `/home/unixusername/nodges/.pi`) setzen.

### 2. `setup-pi-branch.sh`
* Standardwerte fuer `TARGET_PATH` auf `~/nodges` (bzw. `/home/unixusername/nodges`) aktualisieren.
* Standardwerte fuer `CUSTOM_PATH` auf `~/nodges/.pi` bzw. `/home/unixusername/.pi` aktualisieren.

## Verifikation
* Pruefen, ob die Pfade in `.env` und `.env.example` korrekt eingetragen sind.
* Ausfuehren des Container-Starts und Verifizieren der Volume-Mounts mit `docker inspect pi-harness`.
