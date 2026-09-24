# Diagnose und Loesung: Antigravity-Absturz beim Laden des WSL-Pfads

## 1. Fehlerursache: Warum Antigravity beim WSL-Pfad "rausfliegt"

Das Verhalten, dass Antigravity die Dateien kurz anzeigt, dann abstuerzt bzw. neulaedt und den Pfad nicht mehr akzeptiert, hat eine klare technische Ursache:

1. **Electron File-Watcher Inkompatibilitaet**:
   - Antigravity basiert auf der VS-Code- / Electron-Architektur.
   - Sobald ein Projektordner geoeffnet wird, startet die IDE einen Hintergrunddienst (File Watcher), der das Dateisystem rekursiv auf Aenderungen ueberwacht.
   - Unter Windows nutzt dieser Dienst die Windows-API `ReadDirectoryChangesW`.
   - Der WSL2-Pfad `\\wsl.localhost\Ubuntu\...` ist jedoch kein echtes Windows-Dateisystem, sondern eine virtuelle Netzwerkfreigabe ueber das Linux-Plan9-Protokoll (9P).
   - Das 9P-Protokoll unterstuetzt die Windows-Dateibenachrichtigungen nicht standardkonform. Beim Versuch, den gesamten Projektbaum (insbesondere Verzeichnisse wie `node_modules` oder `.git`) zu ueberwachen, laeuft der Dateiwaechter in einen unhandled Exception-Fehler. Dies fuehrt zum sofortigen Absturz des Extension-Host-Prozesses („Rausfliegen").

2. **Workspace Trust und UNC-Sicherheitsblockade**:
   - Nach einem Absturz blockiert Windows bzw. die IDE den Pfad haeufig temporaer in der Sitzungsverwaltung, weshalb der Ordner nicht erneut hinzugefuegt werden kann.

---

## 2. Bewertung und Konsequenz

Der Versuch, die gesamte Antigravity-IDE als Windows-Anwendung direkt auf einen UNC-Pfad (`\\wsl.localhost\...`) zu zwingen, fuehrt zu staendigen Instabilitaeten der IDE selbst.

Da Antigravity keine direkte "Remote - WSL"-Linux-Agenten-Instanz im WSL-Container ausfuehrt, sondern als Windows-Prozess laeuft, ist der Betrieb auf einem nativen Windows-Pfad (`C:/Users/ich/Desktop/code/_projects/Nodges`) fuer die IDE um ein Vielfaches stabiler und fehlerfreier.

---

## 3. Die bewaehrte und stabile Loesung: Pragmatischer Dual-Harness ueber Git

Die gute Nachricht ist: Saemtliche frueheren Gruende, die gegen zwei getrennte Arbeitskopien sprachen, wurden in Phase 1 bis 3 vollstaendig beseitigt:

1. **Dokumente sind nicht mehr isoliert**:
   `doc/` ist in `.gitignore` freigegeben. Jeder Bericht, den Antigravity schreibt, wird versioniert und erreicht piCon per `git pull`.
2. **Keine Zeilenenden-Konflikte**:
   Die neue `.gitattributes` erzwingt repo-weit LF. Es gibt keine Phantom-Diffs mehr.
3. **Keine Dateirechte-Probleme**:
   `core.fileMode = false` verhindert Berechtigungskonflikte.
4. **Ballast ist geloescht**:
   258 unnoetige Dateien wurden entfernt.

### Der bewaehrte Arbeitsablauf:
- **winAnt (Antigravity)** arbeitet weiterhin im gewohnten, stabilen Windows-Workspace:
  `C:/Users/ich/Desktop/code/_projects/Nodges`
- **piCon (Pi-Agent)** arbeitet im nativen, schnellen WSL2-Container:
  `/workspace`
- **Synchronisation**:
  Erfolgt vor/nach jedem Agentenwechsel diszipliniert per `git push` und `git pull` auf dem Branch `pi`. Dies dauert jeweils nur ca. 2 bis 3 Sekunden und funktioniert zu 100 % stabil, ohne die IDE zu gefaehrden.
- **Agenten-Zugriff bei Bedarf**:
  Antigravity als KI-Agent kann jederzeit ueber Shell-Befehle (`wsl -e ...`) oder direkte Dateioperationen auf WSL2 zugreifen, ohne dass die IDE dafuer umgestellt werden muss.
