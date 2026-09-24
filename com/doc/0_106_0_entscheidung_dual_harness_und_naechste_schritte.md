# Architekturentscheidung und Naechste Schritte: Dual-Harness mit Git-Synchronisation

## 1. Ausgangslage und Testergebnis

Der Praxistest, Antigravity als Windows-Desktop-Anwendung direkt auf das WSL2-Netzwerkverzeichnis (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`) als Primaer-Workspace umzustellen, hat gezeigt:
- Die Electron-/VS-Code-Architektur von Antigravity stuerzt beim rekursiven Dateimonitoring ueber die 9P-Netzwerkbruecke ab.
- Ein dauerhafter Betrieb der Antigravity-IDE auf dem UNC-Netzwerkpfad ist technisch nicht stabil moeglich.

---

## 2. Verbindliche Festlegung: Das Dual-Harness-Modell

Da die IDE auf Windows stabil laufen muss und der Container in Linux die maximale Build- und Runtime-Performance liefert, gilt ab sofort folgende feste Rollenteilung:

1. **winAnt (Antigravity)**:
   - Fester Arbeitsbereich: `C:/Users/ich/Desktop/code/_projects/Nodges` (Windows NTFS).
   - Zustaendigkeit: Architektur, Frontend, Three.js-Visualisierung, Dokumentation (`doc/`).
2. **piCon (Pi-Agent)**:
   - Fester Arbeitsbereich: `/workspace` gemountet aus `/home/unixusername/nodges` (WSL2 ext4).
   - Zustaendigkeit: Container-Dienste, Vite DevServer (5173), LightRAG Backend (8000), Linux-Skripte.
3. **Synchronisationsbruecke**:
   - Die Single Source of Truth fuer den Codeaustausch ist das Git-Repository auf GitHub (`origin/pi`).
   - Da `doc/` nun freigegeben ist, `.gitattributes` LF erzwingt und `core.fileMode = false` aktiv ist, laeuft der Git-Sync voellig reibungslos in 2 bis 3 Sekunden.

---

## 3. Die drei konkreten naechsten Schritte

### Schritt 1: Aktualisierung von `bericht.md` und `setup.md`
- In `bericht.md` wird ein neuer Abschnitt 10 ergaenzt:
  - Dokumentation des UNC-Workspace-Tests in Antigravity (Absturz des File-Watchers).
  - Bestaetigung der von piCon durchgefuehrten Schritte (doc/-Freigabe, Ballastbereinigung).
  - Festschreibung des Dual-Harness-Git-Workflows.
- In `setup.md` wird festgehalten, dass Antigravity auf Windows verbleibt und die Synchronisation diszipliniert per `git push` / `git pull` erfolgt.
- Commit und Push zu GitHub, damit piCon im Container sofort informiert ist.

### Schritt 2: Etablierung des einfachen Uebergabe-Rituals
- Vor jedem Wechsel von Antigravity zu Pi: Ein kurzer Commit & Push.
- Nach jedem Wechsel von Pi zu Antigravity: Ein kurzes `git pull origin pi`.

### Schritt 3: Fortsetzen der inhaltlichen Entwicklungsarbeit
- Die Vorarbeiten (Playwright E2E-Tests, Vite-Anbindung, Bereinigung) sind abgeschlossen.
- Wir koennen nun den eigentlichen Projektplan (Plan v4: Nodges Diagnose, Stabilisierung & Refactoring) fortsetzen.
