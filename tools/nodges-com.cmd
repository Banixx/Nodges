@echo off
setlocal
where pwsh >nul 2>&1
if %errorlevel% equ 0 (
    pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0nodges-com.ps1" %*
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0nodges-com.ps1" %*
)
