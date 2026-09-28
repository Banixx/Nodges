<#
.SYNOPSIS
watch_com.ps1 — Ueberwachung von com/ mit automatischer und manueller One-Way-Synchronisation.
#>

[CmdletBinding()]
param (
    [switch]$SyncNow,
    [int]$DebounceMs = 1500,
    [string]$Destination = "C:\Users\ich\Desktop\code\_Nodges_Com_Sync"
)

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$syncScript = Join-Path $PSScriptRoot "sync_com.ps1"

# Direkter Sync-Aufruf per Schalter
if ($SyncNow) {
    if (Test-Path $syncScript) {
        & $syncScript -Destination $Destination
    } else {
        Write-Error "FEHLER: $syncScript wurde nicht gefunden."
    }
    exit 0
}

# Fenstertitel fuer die Taskleiste setzen
try { $host.UI.RawUI.WindowTitle = "Nodges COM-Watcher" } catch {}

# Bus-Pfad tools/com-bus ermitteln
$busPath = Join-Path $PSScriptRoot "com-bus"
if (-not (Test-Path $busPath)) {
    New-Item -ItemType Directory -Path $busPath -Force | Out-Null
}
$pidFile = Join-Path $busPath "nodges-com-watch-windows.pid"

# Single-Instance Schutz fuer Dauermodus
$currentPid = $PID
if (Test-Path $pidFile) {
    $savedPidRaw = (Get-Content $pidFile -Raw -ErrorAction SilentlyContinue).Trim()
    if ($savedPidRaw -match '^\d+$') {
        $savedPid = [int]$savedPidRaw
        if ($savedPid -ne $currentPid -and (Get-Process -Id $savedPid -ErrorAction SilentlyContinue)) {
            Write-Host "Ein COM-Waechter laeuft bereits im Hintergrund (PID $savedPid). Beende diesen Aufruf." -ForegroundColor Yellow
            exit 0
        }
    }
}
Set-Content -Path $pidFile -Value $currentPid -Force

# Quellpfad com/ ermitteln
$comPath = "W:\com"
if (-not (Test-Path $comPath)) {
    $comPath = "\\wsl.localhost\Ubuntu\home\unixusername\nodges\com"
}
if (-not (Test-Path $comPath)) {
    Write-Error "FEHLER: Quellverzeichnis com/ existiert weder unter W:\com noch unter WSL."
    exit 1
}


# Globaler Zustand fuer Synchronisation und Entprellung (Debounce)
$global:syncDestination = $Destination
$global:syncScriptPath = $syncScript
$global:isSyncing = $false
$global:pendingSync = $false

# Synchronisations-Funktion mit Verriegelung (Concurrency Lock)
function global:Invoke-ComSync {
    if ($global:isSyncing) {
        $global:pendingSync = $true
        return
    }
    $global:isSyncing = $true
    try {
        do {
            $global:pendingSync = $false
            if (Test-Path $global:syncScriptPath) {
                & $global:syncScriptPath -Destination $global:syncDestination
            }
        } while ($global:pendingSync)
    } finally {
        $global:isSyncing = $false
    }
}

# Timer fuer Entprellung (Debounce) einrichten
$global:syncTimer = New-Object System.Timers.Timer($DebounceMs)
$global:syncTimer.AutoReset = $false

$actionTimer = {
    Invoke-ComSync
}

# Watcher 1: Ueberwachung com/ (rekursiv)
$watcherCom = New-Object System.IO.FileSystemWatcher
$watcherCom.Path = $comPath
$watcherCom.IncludeSubdirectories = $true
$watcherCom.EnableRaisingEvents = $true

$actionCom = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    # Temporaere Editor-Dateien ignorieren
    if ($path -notmatch '~$|\.tmp$|\.bak$|\.swp$') {
        $timeStr = (Get-Date).ToString("HH:mm:ss")
        Write-Host "[$timeStr] COM_UPDATE: $changeType -> $path" -ForegroundColor DarkGray
        # Entprell-Timer neu starten
        $global:syncTimer.Stop()
        $global:syncTimer.Start()
    }
}

# Watcher 2: Ueberwachung com-bus auf Pings
$watcherBus = New-Object System.IO.FileSystemWatcher
$watcherBus.Path = $busPath
$watcherBus.Filter = "ping-*.md"
$watcherBus.IncludeSubdirectories = $false
$watcherBus.EnableRaisingEvents = $true

$actionBus = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name
    Start-Sleep -Milliseconds 200
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        $timeStr = (Get-Date).ToString("HH:mm:ss")

        # Pruefen auf Sync-Ping
        if ($name -eq "ping-sync.md" -or $name -match '^ping-sync') {
            Write-Host "`n[$timeStr] *** SYNC-SIGNAL EMPFANGEN ($name) ***" -ForegroundColor Magenta
            Remove-Item $path -Force -ErrorAction SilentlyContinue
            Invoke-ComSync
            return
        }

        # Normaler Ping an conT oder all
        if ($name -match '^ping-(conT|all)\.md$') {
            Write-Host "`n[$timeStr] *** PING EMPFANGEN ($name) ***" -ForegroundColor Cyan
            Write-Host $content
            Write-Host "*****************************`n"
            $eventsLog = Join-Path $busPath "events.log"
            $cleanText = ($content -split "`n" | Where-Object { $_.Trim() -and $_ -notmatch '^#' }) -join ' '
            if ($cleanText.Length -gt 500) { $cleanText = $cleanText.Substring(0, 500) }
            $logEntry = "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))  PING       $name  $cleanText"
            Add-Content -Path $eventsLog -Value $logEntry -ErrorAction SilentlyContinue
            Remove-Item $path -Force -ErrorAction SilentlyContinue
        }
    }
}

# Ereignisse registrieren
$subTimer = Register-ObjectEvent -InputObject $global:syncTimer -EventName "Elapsed" -Action $actionTimer
$subCreated = Register-ObjectEvent $watcherCom "Created" -Action $actionCom
$subChanged = Register-ObjectEvent $watcherCom "Changed" -Action $actionCom
$subDeleted = Register-ObjectEvent $watcherCom "Deleted" -Action $actionCom
$subRenamed = Register-ObjectEvent $watcherCom "Renamed" -Action $actionCom
$subBusCreated = Register-ObjectEvent $watcherBus "Created" -Action $actionBus
$subBusChanged = Register-ObjectEvent $watcherBus "Changed" -Action $actionBus

Write-Host "Ueberwache $comPath auf Aenderungen..." -ForegroundColor Green
Write-Host "Ueberwache $busPath auf Pings und Sync-Signale..." -ForegroundColor Green
Write-Host "Zielverzeichnis: $Destination (Debounce: ${DebounceMs}ms)`n" -ForegroundColor Green

# Optional: Initialer Synchronisationsabgleich beim Start
Invoke-ComSync

# Initialer Zustand fuer Heartbeat-Pruefung
$lastScan = [DateTime]::MinValue
$lastFileCount = -1
$lastMaxWriteUtc = [DateTime]::MinValue
$pollIntervalSeconds = 2

try {
    while ($true) {
        Wait-Event -Timeout 1

        # Regelmaessiger Heartbeat-Scan fuer unbedingte Zuverlaessigkeit (WSL2/Netzlaufwerk-Fallback)
        $now = Get-Date
        if (($now - $lastScan).TotalSeconds -ge $pollIntervalSeconds) {
            $lastScan = $now

            # 1. Bus-Ueberwachung auf Pings und Sync-Signale (WSL2-Fallback fuer Linux-Events)
            try {
                $busFiles = Get-ChildItem -Path $busPath -Filter "ping-*.md" -File -ErrorAction SilentlyContinue
                foreach ($bFile in $busFiles) {
                    $name = $bFile.Name
                    $path = $bFile.FullName
                    $content = Get-Content $path -Raw -ErrorAction SilentlyContinue
                    $timeStr = (Get-Date).ToString("HH:mm:ss")
                    if ($name -eq "ping-sync.md" -or $name -match '^ping-sync') {
                        Write-Host "[$timeStr] *** SYNC-SIGNAL VIA HEARTBEAT EMPFANGEN ($name) ***" -ForegroundColor Magenta
                        Remove-Item $path -Force -ErrorAction SilentlyContinue
                        Invoke-ComSync
                    } elseif ($name -match '^ping-(conT|all)\.md$') {
                        Write-Host "`n[$timeStr] *** PING VIA HEARTBEAT EMPFANGEN ($name) ***" -ForegroundColor Cyan
                        Write-Host $content
                        Write-Host "*****************************`n"
                        $eventsLog = Join-Path $busPath "events.log"
                        $cleanText = ($content -split "`n" | Where-Object { $_.Trim() -and $_ -notmatch '^#' }) -join ' '
                        if ($cleanText.Length -gt 500) { $cleanText = $cleanText.Substring(0, 500) }
                        $logEntry = "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))  PING       $name  $cleanText"
                        Add-Content -Path $eventsLog -Value $logEntry -ErrorAction SilentlyContinue
                        Remove-Item $path -Force -ErrorAction SilentlyContinue
                    }
                }
            } catch {}

            # 2. Inhalts-Ueberwachung com/ fuer One-Way-Synchronisation
            try {
                $files = Get-ChildItem -Path $comPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '~$|\.tmp$|\.bak$|\.swp$' }
                if ($files) {
                    $curCount = $files.Count
                    $curMax = ($files | Measure-Object -Property LastWriteTimeUtc -Maximum).Maximum
                    if ($lastFileCount -ne -1 -and ($curCount -ne $lastFileCount -or $curMax -ne $lastMaxWriteUtc)) {
                        $timeStr = (Get-Date).ToString("HH:mm:ss")
                        Write-Host "[$timeStr] Aenderung via Heartbeat erkannt (Dateien: $curCount, Stand: $curMax)." -ForegroundColor DarkGray
                        $global:syncTimer.Stop()
                        $global:syncTimer.Start()
                    }
                    $lastFileCount = $curCount
                    $lastMaxWriteUtc = $curMax
                }
            } catch {}
        }
    }
}
finally {
    # Aufraeumen bei Skriptabbruch
    $subs = @($subTimer, $subCreated, $subChanged, $subDeleted, $subRenamed, $subBusCreated, $subBusChanged)
    foreach ($sub in $subs) {
        if ($sub) {
            Unregister-Event -SourceIdentifier $sub.Name -ErrorAction SilentlyContinue
        }
    }
    $global:syncTimer.Stop()
    $global:syncTimer.Dispose()
    $watcherCom.Dispose()
    $watcherBus.Dispose()
    Remove-Item Function:Invoke-ComSync -ErrorAction SilentlyContinue
    Write-Host "`nUeberwachung beendet." -ForegroundColor Yellow
}
