# Antigravity Index-Reparatur Skript

Dieses Dokument enthält das Skript zur Behebung des "Split-Brain"-Fehlers (Index-Korruption und das 25-Dateien-Limit) in der Antigravity-Seitenleiste.

## ⚠️ WICHTIGE VORBEREITUNG (Zwingend einhalten!)
1. **Schließe Antigravity / VSCode / Cursor komplett.** Es darf nicht im Hintergrund laufen!
2. Führe das Skript erst **danach** aus. Wenn Antigravity läuft, während Dateien verschoben werden, entsteht Chaos und die Datenbank wird wieder überschrieben.

## 🛠️ Ausführung

Du kannst den folgenden Code in einer PowerShell-Konsole ausführen, oder ihn als `repair_antigravity.ps1` speichern und dann starten.

Das Skript macht Folgendes:
1. Es erstellt ein Backup des `conversations`-Ordners (`C:/Users/ich/.gemini/antigravity/conversations_backup_[Datum]`).
2. Es überprüft das 25-Dateien-Limit für die `.pb`-Metadaten.
3. Wenn es mehr als 20 Dateien sind, werden die ältesten ins Backup verschoben, damit Antigravity wieder sauber starten kann, ohne abzustürzen.
4. Optional vorhandene Cache-Dateien (z.B. Index-Korruption) werden bereinigt, um einen frischen Neuaufbau durch Antigravity zu erzwingen.

```powershell
# Antigravity Community-Skript zur Index-Reparatur & Limit-Fix
$antigravityPath = "C:\Users\ich\.gemini\antigravity"
$convPath = Join-Path $antigravityPath "conversations"

if (-Not (Test-Path $convPath)) {
    Write-Host "Der Ordner $convPath wurde nicht gefunden. Abbruch." -ForegroundColor Red
    exit
}

# 1. Backup erstellen
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $antigravityPath "conversations_backup_$timestamp"
Copy-Item -Path $convPath -Destination $backupPath -Recurse -Force
Write-Host "Backup erstellt unter: $backupPath" -ForegroundColor Green

# 2. .pb-Dateien (Metadaten für die Seitenleiste) analysieren
$pbFiles = Get-ChildItem -Path $convPath -Filter "*.pb" | Sort-Object LastWriteTime -Descending

Write-Host "Gefundene .pb-Metadaten-Dateien: $($pbFiles.Count)" -ForegroundColor Cyan

# 3. Das 25-Dateien-Limit beheben (wir reduzieren auf die 20 neusten zur Sicherheit)
$maxFiles = 20

if ($pbFiles.Count -gt $maxFiles) {
    Write-Host "Achtung: Mehr als $maxFiles .pb-Dateien gefunden! Bereinige alte Einträge, um UI-Abstürze zu verhindern..." -ForegroundColor Yellow
    
    $filesToMove = $pbFiles | Select-Object -Skip $maxFiles
    
    $archiveDir = Join-Path $antigravityPath "conversations_archive"
    if (-Not (Test-Path $archiveDir)) {
        New-Item -ItemType Directory -Path $archiveDir | Out-Null
    }
    
    foreach ($file in $filesToMove) {
        Move-Item -Path $file.FullName -Destination $archiveDir -Force
        Write-Host "Archiviert: $($file.Name)" -ForegroundColor DarkGray
    }
    Write-Host "Bereinigung abgeschlossen. Es befinden sich nun maximal $maxFiles .pb-Dateien im Verzeichnis." -ForegroundColor Green
} else {
    Write-Host "Das Limit von 25 Dateien ist nicht überschritten. Keine Archivierung nötig." -ForegroundColor Green
}

# 4. Cache / Index-Korruption bereinigen (Erzwingt Neu-Einlesen der verbleibenden Dateien)
# Suche nach typischen Cache/Index-Dateien, die den "Split-Brain"-Zustand verursachen
$indexFiles = @("index.db", "trajectorySummaries.db", "cache.json")
foreach ($idx in $indexFiles) {
    $idxPath = Join-Path $convPath $idx
    if (Test-Path $idxPath) {
        $renamedIdx = $idxPath + ".corrupted_$timestamp"
        Rename-Item -Path $idxPath -NewName (Split-Path $renamedIdx -Leaf)
        Write-Host "Index-Datei zurückgesetzt (umbenannt): $idx" -ForegroundColor Yellow
    }
}

Write-Host "`n--- Reparatur erfolgreich! ---" -ForegroundColor Green
Write-Host "Du kannst Antigravity nun wieder starten. Die Seitenleiste wird den Datei-Baum neu einlesen." -ForegroundColor Cyan
```

Nachdem das Skript durchgelaufen ist, kannst du deinen Code-Editor bzw. Antigravity wieder ganz normal öffnen. Die Seitenleiste liest dann die Dateien neu ein, ohne durch zu viele `.pb`-Dateien abzustürzen.
