# Antigravity MCP Uebersicht und Status

## 1. Unterstuetzung von MCP in Antigravity
Ja, Antigravity besitzt eine native Unterstuetzung fuer das Model Context Protocol (MCP). Es unterstuetzt zwei Transportmechanismen:
- **Stdio**: Fuer lokale Befehlszeilen-Tools und ausfuehrbare Skripte (z. B. Node.js, Python).
- **SSE (Server-Sent Events)**: Fuer HTTP-basierte Remote-Endpunkte.

## 2. Speicherorte und Konfiguration
- **Globale Konfigurationsdatei**:
  [C:/Users/ich/.gemini/config/mcp_config.json](file:///C:/Users/ich/.gemini/config/mcp_config.json)
- **Tool-Definitionen und Schemata**:
  [C:/Users/ich/.gemini/antigravity/mcp/](file:///C:/Users/ich/.gemini/antigravity/mcp/)
- **Plugin-Ebene (optional)**:
  `plugins/<plugin_name>/mcp_config.json`

## 3. Aktueller Status auf diesem System

### Globale Konfiguration (`mcp_config.json`)
In [C:/Users/ich/.gemini/config/mcp_config.json](file:///C:/Users/ich/.gemini/config/mcp_config.json) sind aktuell folgende Server eingetragen:
1. `blender`:
   - Befehl: `C:/Users/ich/AppData/Roaming/Python/Python313/Scripts/blender-mcp.exe`
   - Status: Deaktiviert (`"disabled": true`)
2. `gitlab-orbit`:
   - Befehl: `npx -y mcp-remote https://gitlab.com/api/v4/orbit/mcp`

### Vorhandene MCP-Tool-Definitionen
Unter [C:/Users/ich/.gemini/antigravity/mcp/](file:///C:/Users/ich/.gemini/antigravity/mcp/) existieren Verzeichnisse fuer:
- `blender` (22 Tool-Schemas, z. B. `execute_blender_code.json`, `render_viewport_to_path.json`)
- `chrome_devtools` (31 Tool-Schemas, z. B. fuer Browser-Automatisierung wie Click, Fill, Screenshot, Trace)

## 4. Verwaltung und UI
MCP-Server koennen in der Benutzeroberflaeche von Antigravity ueber das Menue unter **Additional Options (...) > MCP Servers** geprueft und verwaltet werden.
