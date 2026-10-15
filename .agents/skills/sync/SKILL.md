---
name: sync
description: Spiegelt den gemeinsamen Wissensspeicher W:/com via robocopy 1:1 in den lokalen Windows-Ordner C:/Users/ich/Desktop/code/_Nodges_Com_Sync.
---

# sync (conT)

Verbindliche Quelle des Ablaufs: [W:/tools/sync_com.ps1](file:///W:/tools/sync_com.ps1) im Repo.

## Ausfuehren

Auf dem Windows-Host (conT):

```powershell
powershell.exe -ExecutionPolicy Bypass -File "W:/tools/sync_com.ps1"
```

Oder direkt in PowerShell:

```powershell
pwsh "W:/tools/sync_com.ps1"
```

## Wirkung

- Fuehrt eine One-Way-Spiegelung (`robocopy /MIR`) aller Inhalte aus [W:/com](file:///W:/com) nach [C:/Users/ich/Desktop/code/_Nodges_Com_Sync](file:///C:/Users/ich/Desktop/code/_Nodges_Com_Sync) durch.
- Im Quellordner geloeschte oder umbenannte Dateien werden im Zielordner automatisch bereinigt.
- Nutzt `/FFT` (2-Sekunden Dateizeit-Toleranz) zur Vermeidung unnoetiger Kopiervorgaenge zwischen ext4/WSL2 und Windows NTFS.
- Ignoriert Junction-Points und symbolische Linux-Links (`/XJ`).
- Schliesst temporaere Editor-Dateien (`~*`, `*.tmp`, `*.bak`, `*.swp`) automatisch aus.
- Kein Hintergrund-Waechter, kein Dauer-Polling: laeuft als reiner On-Demand-Befehl auf Anforderung oder bei Bedarf.
