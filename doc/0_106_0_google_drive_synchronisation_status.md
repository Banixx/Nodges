# Status der Google Drive Synchronisation fuer Nodges

## Zusammenfassung
Die Dokumente aus diesem Projekt werden aktuell nicht mehr in die Google Drive Cloud synchronisiert.

Zwar ist der Projektordner in der Konfiguration von Google Drive fuer Desktop als Synchronisations-Ordner hinterlegt, der Dienst ist jedoch inaktiv und der Datenbestand ist seit dem 29.07.2026 nicht mehr abgeglichen worden.

## Detailanalyse

### 1. Prozess- und Dienststatus
- Google Drive Desktop (`GoogleDriveFS.exe`) laeuft derzeit nicht auf dem System.
- In den Anwendungseinstellungen von Google Drive (`C:/Users/ich/AppData/Local/Google/DriveFS/root_preference_sqlite.db`) ist `autostart_on_login: false` hinterlegt.
- Beim Systemstart am heutigen Tag (24.09.2026) wurde Google Drive kurzzeitig mit dem Parameter `--startup_mode` aufgerufen und beendete sich sofort wieder regulaer mit Exit Code 0, da der Autostart deaktiviert ist.

### 2. Konfiguration des Projekts
- In der Google-Drive-Konfiguration (`roots`-Tabelle) ist der Pfad `C:/Users/ich/Desktop/code/_projects/Nodges` unter der internen `root_id = 11` eingetragen.
- Das Projekt wurde als Computer-Ordner (Spiegelung/Upload auf "Mein Computer") eingerichtet.

### 3. Synchronisationsstand des Ordners `doc`
- Letzter erfolgreicher Synchronisationszeitpunkt fuer Dokumente im Projektordner: **29.07.2026, 20:41:59 Uhr** (Datei: `0_102_15_code_bereinigung_bericht.md`).
- Dateianzahl in der Google Drive Datenbank (`mirror_sqlite.db`): **186 Dokumente**.
- Tatsaechliche Dateianzahl auf der Festplatte unter `C:/Users/ich/Desktop/code/_projects/Nodges/doc`: **236 Dokumente**.
- **50 neuere Dokumente** (alle Berichte, Plaene und Analysen der Versionen `0.103.0` und `0.106.0` aus August und September 2026) wurden bisher nicht in die Google Drive Cloud synchronisiert.

### 4. Auffaelligkeiten
- Google Drive hat zuvor versucht, das vollstaendige Projektverzeichnis inklusive `.git/` und temporaerer Dateien zu erfassen. In der lokalen Upload-Warteschlange (`queued_uploads`) befindet sich noch ein nicht uebertragenes Git-Objekt aus dem Juli 2026.
- Solange Google Drive Desktop nicht manuell gestartet wird, erfolgt keinerlei Hintergrund-Synchronisation.
