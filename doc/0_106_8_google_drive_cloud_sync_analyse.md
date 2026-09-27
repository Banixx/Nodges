# Analyse: Google Drive Cloud-Synchronisation fuer _Nodges_Com_Sync

Dokumentversion: 0.106.8
Datum: 2026-09-27
Untersuchte Pfade:
- Zielordner: C:/Users/ich/Desktop/code/_Nodges_Com_Sync
- Google Drive Mountpoint: C:/Users/ich/Desktop/code/DriveOrdner

## 1. Ursachenanalyse: Warum ist es noch nicht online in der Cloud?

Die Pruefung des Systems hat zwei konkrete Ursachen ergeben:

### Ursache 1: Google Drive for Desktop laeuft aktuell nicht
- Die Anwendung `GoogleDriveFS.exe` (Google Drive for Desktop) ist auf dem System installiert (`C:/Program Files/Google/Drive File Stream`), laeuft aber derzeit nicht im Hintergrund.
- In der Registry (`HKCU:\Software\Google\DriveFS`) ist `AutoStartOnLogin` auf `0` gesetzt, weshalb die App beim Windows-Start nicht automatisch gestartet wird.

### Ursache 2: Abweichender Zielpfad
- Das aktuelle Ziel der com-Synchronisation ist der lokale Ordner [C:/Users/ich/Desktop/code/_Nodges_Com_Sync](file:///C:/Users/ich/Desktop/code/_Nodges_Com_Sync).
- Der fuer Google Drive konfigurierte Einhaengepunkt lautet jedoch laut Registry [C:/Users/ich/Desktop/code/DriveOrdner](file:///C:/Users/ich/Desktop/code/DriveOrdner).
- Dateien in `_Nodges_Com_Sync` liegen ausserhalb dieses Mountpoints und werden von Google Drive nicht erfasst, solange der Ordner nicht explizit in Google Drive eingebunden ist.

## 2. Loesungsoptionen

### Option A: Zielpfad in den Google-Drive-Ordner verlegen
Der Zielpfad in [W:/tools/sync_com.ps1](file:///W:/tools/sync_com.ps1) und [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) wird angepasst auf:
`C:/Users/ich/Desktop/code/DriveOrdner/_Nodges_Com_Sync` (bzw. `DriveOrdner/Meine Ablage/...`).
Sobald Google Drive for Desktop laeuft, werden die gespiegelten Dateien automatisch in die Google Cloud hochgeladen.

### Option B: Ordner _Nodges_Com_Sync in Google Drive einbinden
In den Einstellungen der Anwendung "Google Drive for Desktop" kann unter "Mein Computer" der Ordner [C:/Users/ich/Desktop/code/_Nodges_Com_Sync](file:///C:/Users/ich/Desktop/code/_Nodges_Com_Sync) als zusaetzlicher Sicherungsordner hinzugefuegt werden.
