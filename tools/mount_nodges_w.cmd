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
