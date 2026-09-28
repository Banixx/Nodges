@echo off
rem ========================================================
rem Installiert das One-Page Dashboard in ein Zielprojekt
rem Aufruf: install_to_project.cmd "C:\Pfad\Zu\NeuemProjekt"
rem ========================================================

if "%~1"=="" (
    echo [FEHLER] Bitte Zielverzeichnis angeben: install_to_project.cmd "C:\Zielverzeichnis"
    exit /b 1
)

set TARGET_DIR=%~1
if not exist "%TARGET_DIR%" (
    echo [INFO] Erstelle Zielverzeichnis: %TARGET_DIR%
    mkdir "%TARGET_DIR%"
)

set SCRIPT_DIR=%~dp0
copy /Y "%SCRIPT_DIR%dashboard.html" "%TARGET_DIR%\" >nul
copy /Y "%SCRIPT_DIR%dashboard.md" "%TARGET_DIR%\" >nul

echo [ERFOLG] Dashboard erfolgreich nach %TARGET_DIR% kopiert.
echo - HTML: %TARGET_DIR%\dashboard.html
echo - MD:   %TARGET_DIR%\dashboard.md
