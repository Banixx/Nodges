# Betrieb und Autostart der com/-Synchronisation

Dokumentversion: 0.106.8
Datum: 2026-09-27
Gueltigkeitsbereich: Windows 11 Host, WSL2, Laufwerk W:

## 1. Aktueller Betriebsstatus (Aktiv)

Der Waechter-Dienst [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) laeuft derzeit aktiv als lautloser Hintergrundprozess unter Windows und synchronisiert kontinuierlich alle Aenderungen in `com/` nach [C:/Users/ich/Desktop/code/_Nodges_Com_Sync](file:///C:/Users/ich/Desktop/code/_Nodges_Com_Sync).

## 2. Autostart-Konfiguration (Persistenz & Kapselung)

Der Autostart ist zweistufig gekapselt, damit beim Windows-Start keine Konsolenfenster aufpoppen und der COM-Waechter minimiert in der Taskleiste abrufbar ist:
- **Autostart-Datei (Windows):** [C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/mount_nodges_w.vbs](file:///C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start%20Menu/Programs/Startup/mount_nodges_w.vbs)
- **Host-Steuerungsskript:** [C:/Users/ich/Desktop/code/_projects/Nodges_Pi/mount_nodges_w.cmd](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/mount_nodges_w.cmd) (Kopie/Sicherung unter [W:/tools/mount_nodges_w.cmd](file:///W:/tools/mount_nodges_w.cmd))

### 2.1 Inhalt des Startup-VBSkripts (mount_nodges_w.vbs):
```vbscript
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

cmdScript = "C:\Users\ich\Desktop\code\_projects\Nodges_Pi\mount_nodges_w.cmd"

If fso.FileExists(cmdScript) Then
    ' Fensterstil 0 = Vollstaendig unsichtbar / Kein Konsolenfenster
    WshShell.Run "cmd.exe /c " & Chr(34) & cmdScript & Chr(34), 0, False
Else
    WshShell.Run "wsl.exe -d Ubuntu -e true", 0, True
    WshShell.Run "subst W: /D", 0, True
    WshShell.Run "subst W: \\wsl.localhost\Ubuntu\home\unixusername\nodges", 0, True
    WScript.Sleep 2000
    If fso.FileExists("W:\tools\watch_com.ps1") Then
        WshShell.Run "cmd.exe /c start " & Chr(34) & "Nodges COM-Watcher" & Chr(34) & " /min pwsh.exe -NoExit -WindowStyle Minimized -NoLogo -ExecutionPolicy Bypass -File " & Chr(34) & "W:\tools\watch_com.ps1" & Chr(34), 0, False
    End If
End If
```

### 2.2 Inhalt des Batch-Skripts (mount_nodges_w.cmd):
```cmd
@echo off
cd /d %USERPROFILE%

rem 1. Initialisiere WSL Ubuntu (9P-Netzwerkpfad bereitstellen)
wsl.exe -d Ubuntu -e true

rem 2. Trenne altes Mapping, falls vorhanden
subst W: /D >nul 2>&1

rem 3. Verbinde Laufwerk W: mit dem WSL-Nodges-Verzeichnis
subst W: \\wsl.localhost\Ubuntu\home\unixusername\nodges

rem 4. Kurze Pause zur Bereitstellung des Laufwerks
ping 127.0.0.1 -n 3 >nul

rem 5. Starte den COM-Sync-Waechter minimiert in der Taskleiste (kein Fokus-Diebstahl, in Taskleiste abrufbar)
if not exist "W:\tools\watch_com.ps1" goto :eof

where pwsh.exe >nul 2>&1
if %errorlevel% equ 0 (
    start "Nodges COM-Watcher" /min pwsh.exe -NoExit -WindowStyle Minimized -NoLogo -ExecutionPolicy Bypass -File "W:\tools\watch_com.ps1"
) else (
    start "Nodges COM-Watcher" /min powershell.exe -NoExit -WindowStyle Minimized -NoLogo -ExecutionPolicy Bypass -File "W:\tools\watch_com.ps1"
)
```

## 3. Schutzmechanismen und Robustheit

1. **Single-Instance Schutz:**
   [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) prueft ueber die Windows-Prozesstabelle, ob bereits eine Instanz des Waechters aktiv ist. Mehrfachstarts werden verhindert.
2. **Hybride Ueberwachung:**
   Neben der ereignisbasierten Ueberwachung via `FileSystemWatcher` fuehrt das Skript alle 2 Sekunden einen leichtgewichtigen Heartbeat-Scan durch. Dadurch werden auch Aenderungen zuverlaessig erfasst, die innerhalb des Linux-Containers (piCon) ueber das 9P-Netzlaufwerk erfolgen.
3. **Symlink-Schutz:**
   `robocopy` schliesst ueber `/XJ` symbolische Links und Junction-Points aus, wodurch Fehler durch relative Linux-Symlinks vermieden werden.
