# Antigravity Sandbox-Schutzsperren und Sicherheitsgrenzen

## 1. Das Grundproblem

Die Sandbox-Schutzsperre betrifft Datei-Werkzeuge des Agenten (wie `list_dir` oder `view_file`), wenn diese auf Verzeichnisse ausserhalb des Projekt-Workspaces zugreifen wollen.

## 2. Genaue Ursache und Mechanismus

- **Workspace-Isolation**: Der Agent hat vollen Lese- und Schreibzugriff auf den aktiven Projekt-Workspace unter `C:/Users/ich/Desktop/code/_projects/Nodges/`.
- **Hardcoded Protection Boundary**: Versucht der Agent, Pfade ausserhalb des Workspaces zu lesen oder aufzulisten (beispielsweise `C:/Users/ich/.gemini/config`), greift ein hartcodierter Schutzfilter der IDE.
- **Fehlermeldung**: Der Befehl bricht ab mit:
  `Encountered error in step execution: Permission denied for read_file(C:\Users\ich\.gemini\config). Matches hardcoded system protection boundary rule.`

## 3. Auswirkung und Konsequenzen

1. **Unmoeglichkeit der Verzeichnis-Inspektion**: Der Agent kann geschuetzte Pfade wie `C:/Users/ich/.gemini/config/` nicht selbststaendig mit Ordnerauflistungs-Tools durchsuchen.
2. **Halluzinations-Gefahr**: Wenn der Agent den Ordnerinhalt nicht lesen kann, verlaesst er sich auf generische Systeminstruktionen (was zur Halluzination von nicht existierenden Dateien wie `AGENTS.md` fuehren kann).
3. **Erforderliche Freigaben**: Zugriff auf geschuetzte Verzeichnisse erfordert entweder eine explizite Berechtigungsanfrage (`ask_permission`) oder die automatische Injektion durch das Laufzeitsystem beim Start der Sitzung.
