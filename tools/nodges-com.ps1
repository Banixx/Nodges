<#
.SYNOPSIS
nodges-com.ps1 — Der Cross-Harness-Bus fuer com/ (Windows / conT-Seite).

.DESCRIPTION
Gegenstueck zu tools/nodges-com.sh (piCon-Seite).
Ermoeglicht conT und dem Benutzer auf Windows das Senden von Pings, Pruefen des Status,
Lesen und Quittieren von COM-Bus-Ereignissen.

Befehle:
  status                Laeuft der Waechter? Wie viele Ereignisse sind ungelesen?
  read [-Peek]          Neue Ereignisse anzeigen und als gelesen markieren (-Peek laesst Zaehler)
  ack                   Alles als gelesen markieren
  ping <ziel> <text>    Gezielten Weckruf ablegen (piCon, conT oder all)
  watch                 Live-Mitschrift der Ereignisse
  start                 Waechter watch_com.ps1 im Hintergrund starten
  stop                  Waechter anhalten
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$Command = "help",

    [Parameter(Position = 1)]
    [string]$Target,

    [Parameter(Position = 2, ValueFromRemainingArguments = $true)]
    [string[]]$RemainingArgs,

    [switch]$Peek
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$busDir = Join-Path $scriptDir "com-bus"
$eventsLog = Join-Path $busDir "events.log"
$seenFile = Join-Path $busDir "conT.seen"

function Get-LogLinesCount {
    if (Test-Path $eventsLog) {
        return (Get-Content $eventsLog | Measure-Object).Count
    }
    return 0
}

function Get-SeenCount {
    if (Test-Path $seenFile) {
        $val = (Get-Content $seenFile -Raw).Trim()
        if ($val -match '^\d+$') {
            return [int]$val
        }
    }
    return 0
}

function Set-SeenCount([int]$count) {
    if (-not (Test-Path $busDir)) {
        New-Item -ItemType Directory -Path $busDir -Force | Out-Null
    }
    Set-Content -Path $seenFile -Value $count -Force
}

function Format-BusOutput([string]$line) {
    if ($line -match '^#') {
        Write-Host $line -ForegroundColor Magenta
    } elseif ($line -match 'PING') {
        Write-Host $line -ForegroundColor Cyan
    } else {
        Write-Host $line
    }
}

switch ($Command.ToLower()) {
    "help" {
        Get-Help $MyInvocation.MyCommand.Definition
    }

    "status" {
        $pidFile = Join-Path $busDir "nodges-com-watch-windows.pid"
        $isRunning = $false
        $activePid = 0
        if (Test-Path $pidFile) {
            $raw = (Get-Content $pidFile -Raw -ErrorAction SilentlyContinue).Trim()
            if ($raw -match '^\d+$') {
                $checkPid = [int]$raw
                $p = Get-Process -Id $checkPid -ErrorAction SilentlyContinue
                if ($p -and $p.ProcessName -match '^(powershell|pwsh)$') {
                    $isRunning = $true
                    $activePid = $checkPid
                }
            }
        }
        if ($isRunning) {
            Write-Host "COM-Waechter (Windows conT): laeuft (PID $activePid)" -ForegroundColor Magenta
        } else {
            Write-Host "COM-Waechter (Windows conT): laeuft NICHT - starten mit: .\tools\nodges-com.ps1 start" -ForegroundColor Yellow
        }
        Write-Host "Bus-Protokoll:  $eventsLog"

        $total = Get-LogLinesCount
        $seen = Get-SeenCount
        $unread = [Math]::Max(0, ($total - $seen))
        if ($unread -gt 0) {
            Write-Host "$unread neue Ereignisse fuer conT (gesehen: $seen, insgesamt: $total)" -ForegroundColor Cyan
        } else {
            Write-Host "Keine neuen Ereignisse fuer conT (insgesamt: $total)."
        }
        if (Test-Path $eventsLog) {
            Write-Host "Die letzten Zeilen:" -ForegroundColor DarkGray
            Get-Content $eventsLog -Tail 5 | ForEach-Object { Format-BusOutput $_ }
        }
    }

    "read" {
        if (-not (Test-Path $eventsLog)) {
            Write-Host "Noch kein Protokoll vorhanden ($eventsLog)."
            return
        }
        $seen = Get-SeenCount
        $allLines = Get-Content $eventsLog
        $total = $allLines.Count
        if ($seen -ge $total) {
            Write-Host "Nichts Neues im COM-Bus fuer conT." -ForegroundColor Magenta
            return
        }
        $startIdx = $seen
        $endIdx = $total - 1
        $newLines = $allLines[$startIdx..$endIdx]
        $startLineNum = $seen + 1
        Write-Host "Neues im COM-Bus (Zeilen $startLineNum bis $total):" -ForegroundColor Magenta
        foreach ($line in $newLines) {
            if ($line -notmatch '^#') {
                Format-BusOutput $line
            }
        }
        if (-not $Peek) {
            Set-SeenCount $total
        }
    }

    "ack" {
        $total = Get-LogLinesCount
        Set-SeenCount $total
        Write-Host "Alles als gelesen markiert ($total Zeilen in conT.seen)." -ForegroundColor Green
    }

    "ping" {
        $ziel = if ($Target) { $Target } else { "all" }
        $text = if ($RemainingArgs) { $RemainingArgs -join ' ' } else { "" }
        if (-not $text) {
            Write-Error 'FEHLER: Text fehlt. Syntax: .\tools\nodges-com.ps1 ping <ziel> "<text>"'
            exit 1
        }
        if (-not (Test-Path $busDir)) {
            New-Item -ItemType Directory -Path $busDir -Force | Out-Null
        }
        $pingFile = Join-Path $busDir "ping-$ziel.md"
        $dateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        $header = "# PING von conT an $ziel - $dateStr"
        $body = $header + "`n" + $text
        Set-Content -Path $pingFile -Value $body -Encoding utf8 -Force
        Write-Host "PING abgelegt: $pingFile" -ForegroundColor Cyan
    }

    "watch" {
        if (-not (Test-Path $eventsLog)) {
            New-Item -ItemType File -Path $eventsLog -Force | Out-Null
        }
        Write-Host "Live-Mitschrift von $eventsLog - Abbruch mit Strg+C" -ForegroundColor Magenta
        Get-Content $eventsLog -Wait -Tail 20 | ForEach-Object { Format-BusOutput $_ }
    }

    "start" {
        $watchScript = Join-Path $scriptDir "watch_com.ps1"
        if (-not (Test-Path $watchScript)) {
            Write-Error "FEHLER: $watchScript nicht gefunden."
            exit 1
        }
        Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$watchScript`"" -WindowStyle Hidden
        Start-Sleep -Seconds 1
        & $MyInvocation.MyCommand.Definition status
    }

    "stop" {
        $existing = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
            $_.Name -match '^(powershell|pwsh)\.exe$' -and
            $_.CommandLine -match 'watch_com\.ps1' -and
            $_.CommandLine -notmatch '-Command'
        }
        if ($existing) {
            foreach ($p in $existing) {
                Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
            }
            Write-Host "COM-Waechter (Windows conT) gestoppt." -ForegroundColor Magenta
        } else {
            Write-Host "Kein laufender COM-Waechter gefunden."
        }
    }

    default {
        Write-Error "Unbekannter Befehl: $Command. Erlaubt: status, read, ack, ping, watch, start, stop"
        exit 1
    }
}
