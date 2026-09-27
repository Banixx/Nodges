# Betrieb und Autostart der com/-Synchronisation

Dokumentversion: 0.106.8
Datum: 2026-09-27
Gueltigkeitsbereich: Windows 11 Host, WSL2, Laufwerk W:

## 1. Aktueller Betriebsstatus (Aktiv)

Der Waechter-Dienst [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) laeuft derzeit aktiv als lautloser Hintergrundprozess unter Windows und synchronisiert kontinuierlich alle Aenderungen in `com/` nach [C:/Users/ich/Desktop/code/_Nodges_Com_Sync](file:///C:/Users/ich/Desktop/code/_Nodges_Com_Sync).

## 2. Autostart-Konfiguration (Persistenz)

Der Autostart wurde direkt in das bestehende Windows-Startup-Skript eingebunden:
- **Datei:** [C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/mount_nodges_w.cmd](file:///C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start%20Menu/Programs/Startup/mount_nodges_w.cmd)

### Vollstaendiger Inhalt des Startup-Skripts:
```cmd
@echo off
cd /d %USERPROFILE%
rem Initialisiere WSL Ubuntu, damit der 9P-Netzwerkpfad verfuegbar ist
wsl.exe -d Ubuntu -e true
rem Trenne altes Mapping, falls vorhanden
subst W: /D >nul 2>&1
rem Verbinde Laufwerk W: mit dem Nodges-Verzeichnis
subst W: \\wsl.localhost\Ubuntu\home\unixusername\nodges

rem Kurze Pause zur Bereitstellung des Laufwerks
ping 127.0.0.1 -n 3 >nul

rem Starte den COM-Sync-Waechter lautlos im Hintergrund
if exist "W:\tools\watch_com.ps1" (
    where pwsh.exe >nul 2>&1
    if errorlevel 1 (
        start "" powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "W:\tools\watch_com.ps1"
    ) else (
        start "" pwsh.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "W:\tools\watch_com.ps1"
    )
)
```

## 3. Schutzmechanismen und Robustheit

1. **Single-Instance Schutz:**
   [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) prueft ueber die Windows-Prozesstabelle, ob bereits eine Instanz des Waechters aktiv ist. Mehrfachstarts werden verhindert.
2. **Hybride Ueberwachung:**
   Neben der ereignisbasierten Ueberwachung via `FileSystemWatcher` fuehrt das Skript alle 2 Sekunden einen leichtgewichtigen Heartbeat-Scan durch. Dadurch werden auch Aenderungen zuverlaessig erfasst, die innerhalb des Linux-Containers (piCon) ueber das 9P-Netzlaufwerk erfolgen.
3. **Symlink-Schutz:**
   `robocopy` schliesst ueber `/XJ` symbolische Links und Junction-Points aus, wodurch Fehler durch relative Linux-Symlinks vermieden werden.
