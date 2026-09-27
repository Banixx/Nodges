$watcherCom = New-Object System.IO.FileSystemWatcher
$watcherCom.Path = "W:\com"
$watcherCom.IncludeSubdirectories = $true
$watcherCom.EnableRaisingEvents = $true

$watcherBus = New-Object System.IO.FileSystemWatcher
$watcherBus.Path = "W:\tools\com-bus"
$watcherBus.Filter = "ping-*.md"
$watcherBus.IncludeSubdirectories = $false
$watcherBus.EnableRaisingEvents = $true

$actionCom = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    if ($path -notmatch '~$|\.tmp$|\.bak$') {
        Write-Host "COM_UPDATE: Datei $path wurde geaendert ($changeType)."
    }
}

$actionBus = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name
    if ($name -match '^ping-(conT|all)\.md$') {
        # Kleine Pause, um sicherzustellen, dass die Datei vollstaendig geschrieben wurde
        Start-Sleep -Milliseconds 200
        if (Test-Path $path) {
            $content = Get-Content $path -Raw
            Write-Host "`n*** PING EMPFANGEN ($name) ***"
            Write-Host $content
            Write-Host "*****************************`n"
            Remove-Item $path -Force -ErrorAction SilentlyContinue
        }
    }
}

Register-ObjectEvent $watcherCom "Created" -Action $actionCom > $null
Register-ObjectEvent $watcherCom "Changed" -Action $actionCom > $null
Register-ObjectEvent $watcherBus "Created" -Action $actionBus > $null
Register-ObjectEvent $watcherBus "Changed" -Action $actionBus > $null

Write-Host "Ueberwache W:\com auf Aenderungen und W:\tools\com-bus auf Pings..."

try {
    while ($true) {
        Wait-Event -Timeout 1
    }
}
finally {
    Unregister-Event -SourceIdentifier $watcherCom.Name -ErrorAction SilentlyContinue
    Unregister-Event -SourceIdentifier $watcherBus.Name -ErrorAction SilentlyContinue
    $watcherCom.Dispose()
    $watcherBus.Dispose()
}
