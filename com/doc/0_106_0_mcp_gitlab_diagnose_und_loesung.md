# Diagnose und Loesung: GitLab Login-Popup in Firefox

## Ursache

Das wiederkehrende Aufpoppen von Firefox auf der GitLab-Login-Seite wird direkt durch den in Antigravity konfigurierten MCP-Server `gitlab-orbit` ausgeloest.

In der globalen Konfigurationsdatei `C:/Users/ich/.gemini/config/mcp_config.json` ist folgender Eintrag hinterlegt:

```json
"gitlab-orbit": {
  "args": [
    "-y",
    "mcp-remote",
    "https://gitlab.com/api/v4/orbit/mcp"
  ],
  "command": "npx",
  "disabled": true
}
```

### Technische Details der Fehlerursache:
1. **Ignorieren des Flags `disabled: true`**: Der Language Server von Antigravity (`language_server.exe`) ignoriert den Parameter `"disabled": true` und startet den Stdio-Prozess trotzdem im Hintergrund.
2. **OAuth-Trigger durch `mcp-remote`**: `mcp-remote` versucht, sich mit der GitLab-Orbit-MCP-Schnittstelle zu verbinden. Da kein Authentifizierungs-Token vorhanden ist, oeffnet `mcp-remote` den Betriebssystem-Standardbrowser zur Authentifizierung.
3. **Falscher Browser**: Da Firefox (`ff`) als Standardbrowser in Windows definiert ist, oeffnet sich Firefox statt Chrome. Da in Firefox keine aktive GitLab-Sitzung existiert, erscheint die Anmeldeseite.
4. **5-Minuten-Rhythmus**: Nach einem Verbindungsabbruch oder Timeout startet der MCP-Client regelmaessig neue Verbindungsversuche und oeffnet dabei jedes Mal ein neues Browserfenster. Zudem laufen im Hintergrund bereits mehrere verwaiste `mcp-remote`-Instanzen (`node.exe` / `cmd.exe`).

## Loesungsschritte

### 1. Eintrag aus der MCP-Konfiguration entfernen
In der Datei `C:/Users/ich/.gemini/config/mcp_config.json` muss der Block `"gitlab-orbit"` vollstaendig geloescht werden (ebenso `"github-mcp-server"`, falls dieser nicht via Docker laufen soll):

```json
{
  "mcpServers": {
    "blender": {
      "command": "C:\\Users\\ich\\AppData\\Roaming\\Python\\Python313\\Scripts\\blender-mcp.exe",
      "disabled": true
    }
  }
}
```

### 2. Laufende Prozesse im Hintergrund beenden
Die haengenden Instanzen muessen beendet werden. In PowerShell:

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*mcp-remote*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```
