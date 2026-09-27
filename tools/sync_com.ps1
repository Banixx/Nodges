<#
.SYNOPSIS
sync_com.ps1 — One-Way-Synchronisation von com/ nach C:/Users/ich/Desktop/code/_Nodges_Com_Sync.
#>

[CmdletBinding()]
param (
    [string]$Source,
    [string]$Destination = "C:\Users\ich\Desktop\code\_Nodges_Com_Sync",
    [switch]$Quiet
)

# Automatische Quellpfad-Ermittlung
if (-not $Source) {
    if (Test-Path "W:\com") {
        $Source = "W:\com"
    } elseif (Test-Path "\\wsl.localhost\Ubuntu\home\unixusername\nodges\com") {
        $Source = "\\wsl.localhost\Ubuntu\home\unixusername\nodges\com"
    } else {
        Write-Error "FEHLER: Quellverzeichnis com/ konnte weder unter W:\com noch unter \\wsl.localhost\Ubuntu\home\unixusername\nodges\com gefunden werden."
        exit 1
    }
}

if (-not (Test-Path $Source)) {
    Write-Error "FEHLER: Quellverzeichnis '$Source' existiert nicht."
    exit 1
}

# Sicherstellen, dass das Zielverzeichnis existiert
if (-not (Test-Path $Destination)) {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
if (-not $Quiet) {
    Write-Host "[$timestamp] Starte Synchronisation ($Source -> $Destination)..." -ForegroundColor Cyan
}

# Robocopy Parameter:
# /MIR  : Exakte Verzeichnisspiegelung inklusive Loeschen im Ziel entfernter Dateien
# /FFT  : 2-Sekunden FAT-Dateizeit-Toleranz (verhindert falsche Zeitstempel-Abweichungen bei WSL/Netzlaufwerken)
# /R:2  : 2 Wiederholungsversuche bei Dateisperren
# /W:1  : 1 Sekunde Wartezeit zwischen Wiederholungen
# /XJ   : Ausschluss von Junction-Points und symbolischen Links (vermeidet Fehler bei Linux-Symlinks)
# /XF   : Ausschluss temporaerer Editor-Dateien (~*, *.tmp, *.bak, *.swp)
# /NP   : Kein Fortschrittsbalken
# /NDL  : Keine Verzeichnisauflistung (kompakte Ausgabe)
# /NFL  : Keine Dateiauflistung (kompakte Ausgabe)
$robocopyArgs = @(
    $Source,
    $Destination,
    "/MIR",
    "/FFT",
    "/XJ",
    "/R:2",
    "/W:1",
    "/XF", "~*", "*.tmp", "*.bak", "*.swp",
    "/NP",
    "/NDL",
    "/NFL"
)

$output = robocopy @robocopyArgs
$exitCode = $LASTEXITCODE

# Exit-Codes < 8 bedeuten Erfolg bei Robocopy:
# 0 = Nichts geaendert, 1 = Dateien kopiert, 2 = Extras geloescht, 3 = Kopiert und geloescht
if ($exitCode -lt 8) {
    if (-not $Quiet) {
        $statusText = switch ($exitCode) {
            0 { "Bereits synchron (keine Aenderungen)." }
            1 { "Dateien erfolgreich synchronisiert." }
            2 { "Geloeschte Dateien im Ziel bereinigt." }
            3 { "Dateien synchronisiert und Ziel bereinigt." }
            default { "Synchronisation erfolgreich (Exit-Code $exitCode)." }
        }
        Write-Host "[$timestamp] $statusText" -ForegroundColor Green
    }
    exit 0
} else {
    Write-Error "FEHLER bei Robocopy (Exit-Code $exitCode)."
    if (-not $Quiet) {
        $output | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    }
    exit $exitCode
}
