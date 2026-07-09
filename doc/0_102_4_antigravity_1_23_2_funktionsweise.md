# Funktionsweise von Google Antigravity 1.23.2

## 1. Überblick
Google Antigravity 1.23.2 ist ein fortschrittlicher, agentenbasierter KI-Programmierassistent, entwickelt von Google Deepmind. In der Version 1.x agiert das System als tief in die lokale Entwicklungsumgebung (VSCode OSS) integrierter Agent. Es handelt sich nicht um einen reinen Chatbot, sondern um ein autonomes System, das komplexe Entwicklungsaufgaben selbstständig plant, durchführt und verifiziert.

## 2. Systemarchitektur und Umgebung
Die Version 1.23.2 läuft eingebettet in einer massgeschneiderten VSCode OSS-Umgebung:
- **Editor**: VSCode OSS (1.107.0)
- **Engine**: Electron 39.2.3, Node.js 22.21.1, Chromium 142.0.7444.175
- **Language Server**: Bietet tiefes semantisches Verständnis des Codes (CL 900566399).

Das System arbeitet direkt auf dem lokalen Dateisystem des Nutzers und versteht die Workspace-Struktur vollständig.

## 3. Agentische Werkzeuge (Tools)
Antigravity besitzt eine Vielzahl an direkten Schnittstellen, um als eigenständiger Entwickler zu agieren:
- **Dateimanagement**: Das System kann Dateien gezielt lesen, punktuell oder mehrfach ändern und neu erstellen, ohne den gesamten Code neu ausgeben zu müssen.
- **Terminal-Kontrolle**: Der Agent kann Konsolenbefehle (wie PowerShell) ausführen, Hintergrundprozesse starten, interaktive Eingaben senden und Ausgaben überwachen.
- **Web- und Browser-Integration**: 
  - Integrierte Web-Suche und das direkte Auslesen von URLs.
  - Ein **Browser-Subagent**: Ein spezialisierter KI-Unteragent, der einen virtuellen Browser steuern kann (Klicken, Tippen, Navigieren), um Web-Apps zu testen oder Recherchen durchzuführen. Diese Sitzungen können als Video aufgezeichnet werden.
- **Bilderstellung**: Kann Bilder, Assets und UI-Mockups generieren, um iterative Designprozesse direkt zu unterstützen.

## 4. Wissensmanagement und Kontext (Brain & KI)
Ein zentrales Merkmal der 1.x Architektur ist das persistente Gedächtnis im `C:/Users/ich/.gemini/antigravity` Verzeichnis, welches sich in zwei Mechanismen aufteilt:
- **Knowledge Items (KIs)**: Das primäre und aktive Gedächtnis. Wichtige Architekturentscheidungen werden hier als Markdown-Wiki destilliert. Diese KIs werden bei jedem neuen Sitzungsstart *automatisch* geprüft.
- **Conversation Logs (Brain)**: Das rohe Langzeitgedächtnis. Hier liegen alle vergangenen Chat-Verläufe als Textdateien (`overview.txt`). 
  - **Wichtig zur Funktionsweise**: Wenn du ein Thema ansprichst, das vor Monaten diskutiert wurde, wird dieses *nicht* automatisch in den aktuellen Kontext geladen, es sei denn, es existiert ein passendes KI dazu. Meine Standard-Zusammenfassungen umfassen nur die letzten 10 Sitzungen. 
  - Um altes Wissen aus dem Brain zu reaktivieren, musst du entweder eine spezifische `@conversation` ID verlinken, oder mich explizit anweisen, mit meinen Werkzeugen (wie der Dateisuche) die alten Logs im `brain`-Ordner nach diesem speziellen Thema zu durchsuchen.

### 4.1. Das 25-Sessions-Limit und verwaiste Brain-Ordner
Es gibt in der Antigravity-Struktur eine strikte Trennung zwischen der UI-Darstellung und den eigentlichen Daten:
- **`conversations` Ordner**: Enthält Metadaten-Dateien (`.pb`), die *ausschliesslich* dafür zuständig sind, die Liste der alten Sitzungen in der VSCode-Seitenleiste anzuzeigen. **Genau hier liegt das Limit:** Sobald 25 dieser Dateien existieren, stürzt die interne UI-Ladelogik nach einem Neustart ab und neue Sessions werden nicht mehr angezeigt.
- **`brain` Ordner**: Enthält die eigentlichen Log-Texte und hat **kein** technisches Limit. 
Wenn du in deinem System mehr `brain`-Ordner hast als `.pb`-Dateien, liegt das daran, dass manche Sitzungen fehlerhaft beendet oder aufgrund des 25-Session-Limits nicht im UI gespeichert werden konnten. Das System legt beim Start einer Unterhaltung sofort den `brain`-Ordner an, scheitert aber später oft an der Erstellung der `.pb`-Datei, wodurch unsichtbare "verwaiste" Ordner entstehen. Daher räumt der `/archiv_sessions` Workflow primär die `.pb` Dateien auf, verschiebt aber der Ordnung halber die dazugehörigen intakten `brain`-Ordner gleich mit ins Archiv.

## 5. Workflows und Model Context Protocol (MCP)
- **Workflows**: Markdown-basierte Skripte (wie `/versionierungworkflow` oder `/devcontainer-setup`), die Antigravity Schritt für Schritt abarbeitet und bei Bedarf Befehle vollautomatisch ausführt.
- **MCP-Server**: Antigravity unterstützt das Model Context Protocol, um dynamisch mit externen Programmen und APIs zu kommunizieren (zum Beispiel direkte Interaktion mit Blender-Szenen oder das Durchsuchen von gebündelten Handbüchern).
