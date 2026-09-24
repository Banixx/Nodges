# Aktuelle Recherche: Antigravity IDE ignoriert Systemprompts bei Dateischreibvorgängen

Eine erneute, tiefergehende Webrecherche zur aktuellen Version der Antigravity IDE hat ergeben, dass das Ignorieren von Systemprompts beim Schreiben von Dateien meist nicht an fehlerhaften Prompts liegt, sondern an der internen **Permission Engine** und den **Agent Settings**:

1. **Permission Logic & "Implicit Coverage":**
   Die Antigravity IDE nutzt eine vereinheitlichte Berechtigungs-Engine für `read_file` und `write_file`. Ein bekanntes Problem ist die sogenannte "Implicit Coverage": Wenn eine `write_file`-Regel auf "Always Ask" gesetzt ist, behandelt der Agent oft auch die zugehörige `read_file`-Berechtigung für denselben Pfad restriktiv. Wenn "Always Ask"- oder "Deny"-Regeln zu breit gefasst sind, kann das zu unerwartetem Verhalten führen.
   *Lösung:* In den IDE-Einstellungen unter **Settings > Command Execution & File Access** prüfen, ob die Regeln zu allgemein formuliert sind, und diese pfadspezifischer eingrenzen.

2. **Workspace Isolation & Strict Mode:**
   Im **Strict Mode** erzwingt der Agent starre Grenzen. Versuche, ausserhalb des zugewiesenen Workspaces zu schreiben, werden von der Security Sandbox blockiert. Das betrifft auch das Terminal-Sandboxing (z. B. via `nsjail`), welches Schreibvorgänge ausserhalb der autorisierten Umgebung unterbindet.

3. **Globale Konfigurationsdatei:**
   Bei Nutzung der CLI oder erweiterter Konfigurationen sollte die Datei `settings.json` (unter `~/.gemini/antigravity-cli/settings.json` bzw. dem entsprechenden Windows-Pfad) auditiert werden. Dort definierte globale "Allow/Deny"-Listen können Systemprompts komplett überschreiben.

4. **Konflikte mit .geminiignore:**
   Ähnlich wie `.gitignore` respektiert der Agent eine `.geminiignore`-Datei. Dies führt manchmal zu Inkonsistenzen: Obwohl der Agent die Datei eigentlich ignorieren sollte, kann er manchmal durch Prompts "überredet" werden, doch darauf zuzugreifen, was zu unberechenbarem Verhalten führt.

**Zusammenfassung:**
Um dem Agenten das Schreiben gegen den Systemprompt abzugewöhnen, müssen die Einstellungen unter **Settings > Command Execution & File Access** (oder in der `settings.json`) restriktiver und spezifischer konfiguriert werden, da die interne Permission-Engine der IDE den reinen Text-Prompts übergeordnet ist.
