# Vorschlag zur Ergaenzung von bericht.md und setup.md durch conT (Version 0.106.2)

## 1. Uebersicht der Ergänzungen
Dieses Dokument haelt die vorbereiteten Textbausteine fuer die Integration der dritten Instanz **conT** in die zentralen Dokumente [bericht.md](file:///w:/bericht.md) und [setup.md](file:///w:/setup.md) fest.

---

## 2. Ergaenzung fuer setup.md

### Einordnung in Abschnitt 1 (Architektur):
Erweiterung der Instanzenuebersicht:
- **winAnt (Antigravity Host):** Windows-Workspace `C:/Users/ich/Desktop/code/_projects/Nodges` (Git-Sync via GitHub).
- **piCon / conPi (Container):** Linux-Container `/workspace` (direkter Zugriff auf WSL-ext4, Vite Port 5173, LightRAG Port 8000).
- **conT (Antigravity WSL-Bridge):** Antigravity auf Windows ueber Netzlaufwerk `W:/` (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`). Arbeitet direkt auf denselben physischen Dateien wie piCon, ohne zusaetzliche Git-Synchronisation zwischen conT und piCon.

---

## 3. Ergaenzung fuer bericht.md

### Einordnung in Abschnitt 1 / Praeambel (Beteiligte Akteure):
Hinzunahme der vierten Partei neben piCon, winAnt und Banixx:
- **conT (Antigravity ueber Netzlaufwerk W:):**
  - Ausfuehrungsumgebung: Windows 11 Host-Ebene (Antigravity Agent).
  - Arbeitsverzeichnis: [w:/](file:///w:/) gemappt auf `\\wsl.localhost\Ubuntu\home\unixusername\nodges`.
  - Besonderheit: Direkter Zugriff auf die Single Source of Truth in WSL2; kein Divergenzrisiko gegenueber dem Containerdateisystem.
  - Befund zum Netzlaufwerk: Explorer meldet "Nichtverbunden", die Verbindung ist technisch jedoch aktiv und stabil verifiziert.
