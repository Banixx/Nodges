<#
.SYNOPSIS
nodges-com.ps1 — der Cross-Harness-Bus fuer com/ (conT-Seite).
#>

param (
    [string]$Command = "help",
    [string]$Target = "all",
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Text
)

$ROOT = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$COM = Join-Path $ROOT "com"
$BUS = Join-Path $ROOT "tools\com-bus"
$PROTOKOLL = Join-Path $BUS "events.log"

switch ($Command) {
    "ping" {
        if (-not $Text) {
            Write-Host "FEHLER: Text fehlt. Beispiel: .\nodges-com.ps1 ping piCon `"bitte Datei X lesen`"" -ForegroundColor Red
            exit 1
        }
        if (-not (Test-Path $BUS)) {
            New-Item -ItemType Directory -Path $BUS | Out-Null
        }
        $zieldatei = Join-Path $BUS "ping-$Target.md"
        $msg = "# PING von conT an $Target - $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))`n$($Text -join ' ')"
        Set-Content -Path $zieldatei -Value $msg
        Write-Host "PING abgelegt: $zieldatei" -ForegroundColor Magenta
    }
    "status" {
        if (Test-Path $PROTOKOLL) {
            $lines = (Get-Content $PROTOKOLL).Count
            Write-Host "Bus-Protokoll existiert mit $lines Zeilen: $PROTOKOLL" -ForegroundColor Cyan
        } else {
            Write-Host "Kein Bus-Protokoll vorhanden." -ForegroundColor Yellow
        }
    }
    "read" {
        if (Test-Path $PROTOKOLL) {
            Write-Host "Letzte Ereignisse:" -ForegroundColor Cyan
            Get-Content $PROTOKOLL -Tail 15
        } else {
            Write-Host "Protokoll existiert noch nicht."
        }
    }
    "sync" {
        $syncScript = Join-Path $ROOT "tools\sync_com.ps1"
        if (Test-Path $syncScript) {
            & $syncScript
        } else {
            Write-Host "FEHLER: $syncScript nicht gefunden." -ForegroundColor Red
        }
    }
    "help" {
        Write-Host "Befehle fuer conT:`n  sync               : One-Way-Sync nach Desktop ausfuehren`n  ping <ziel> <text> : Weckruf senden (z.B. piCon)`n  status             : Bus-Status anzeigen`n  read               : Letzte Logeintraege ansehen" -ForegroundColor Cyan
    }
    default {
        Write-Host "Unbekannter Befehl: $Command" -ForegroundColor Red
    }
}
