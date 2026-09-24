# Multi-Harness Architektur- und Synchronisationsanalyse (Nodges)

## 1. Zielsetzung und Kontext

Dieses Dokument fasst die architektonischen, dateisystembezogenen und git-technischen Grundlagen fuer den gemeinsamen Betrieb mehrerer KI-Coding-Harnesses am Projekt **Nodges** zusammen.

Die beteiligten Entwicklungsumgebungen sind:
- **winAnt**: Antigravity auf Windows 11 (Host-Ebene, Pfad `C:/Users/ich/Desktop/code/_projects/Nodges`).
- **piCon**: Pi Coding Agent im Docker-Container `pi-harness` unter WSL2/Ubuntu (Container-Pfad `/workspace`).
- **GitHub**: Zentrales Remote-Repository unter `https://github.com/Banixx/Nodges`.

Ziel ist es, dass beide Harnesses zuverlaessig auf dasselbe Repository zugreifen koennen, gegenseitige Code- und Architektur-Aenderungen unmittelbar verfuegbar sind und saemtliche Dokumentationen, Analyseberichte und Plaene lucckenlos zwischen `winAnt` und `piCon` ausgetauscht werden.

---

## 2. Bestandsaufnahme und Erkenntnisse aus bisherigen Sessions

Die Analyse der aktuellen Projektkonfiguration, der Docker-Umgebung und der Git-Historie liefert folgende zentrale Fakten:

### 2.1 Die Realitaet der zwei getrennten Arbeitskopien (Dual-Clone)
Entgegen der intuitiven Annahme, dass der Container direkt den Windows-Ordner `C:/Users/ich/Desktop/code/_projects/Nodges` einbindet, existieren auf der Maschine aktuell **zwei unabhaengige lokale Git-Klone**:
1. **Windows-Arbeitskopie**: `C:/Users/ich/Desktop/code/_projects/Nodges` (wird von `winAnt` genutzt).
2. **WSL2-Arbeitskopie**: `//wsl.localhost/Ubuntu/home/unixusername/nodges` bzw. `/home/unixusername/nodges` im Linux-Dateisystem.

Der Container `pi-harness` mountet gemaess `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env` die Variable:
`REPO_PATH=\\wsl.localhost\Ubuntu\home\unixusername\nodges` auf `/workspace`.
Dateiaenderungen, die lokal auf Windows durchgefuehrt werden, sind fuer `piCon` im Container physisch nicht sichtbar, solange sie nicht committet, gepusht und im anderen Klon gepullt werden (oder manuell synchronisiert werden).

### 2.2 Die Git-Konfiguration und der Branch-Status
- Beide Repositories nutzen als Primaer-Entwicklungszweig den Branch `pi`.
- Der Branch `pi` steht in beiden Repositories und auf GitHub auf Commit `80236c5` (*docs: Plan v4 Nodges Diagnose, Stabilisierung & Refactoring hinzufuegen*).
- Historische Nebenbranches (`feature/multi-build`, `VersionA`, `VersionB`) wurden in vorherigen Sessions bereinigt.
- Der Branch `main` ist stabil vorhanden, liegt jedoch 13 Commits hinter `pi` und kann jederzeit per Fast-Forward aktualisiert werden.
- Remotes:
  - Windows (`winAnt`): `https://github.com/Banixx/Nodges.git` via Windows Credential Manager.
  - WSL2 / Container (`piCon`): `git@github.com:Banixx/Nodges.git` (SSH) bzw. HTTPS ueber das persistente Volume `/home/.pi/git-credentials` und GitHub-Token.

### 2.3 Die Blockade fuer Dokumentationen durch .gitignore
Eine kritische Diskrepanz liegt in der Behandlung von Dokumentationen:
- Die Systemregel fuer `winAnt` verlangt, dass alle Berichte, Plaene und Feststellungen im Ordner `[Projektordner]/doc` mit Versions-Praefix abgelegt werden.
- In `C:/Users/ich/Desktop/code/_projects/Nodges/.gitignore` steht in Zeile 54 explizit: `doc/`.
- **Auswirkung**: Saemtliche in `doc/` erstellten Dateien (ueber 80 Dokumente) sind fuer Git unsichtbar (`git ls-files doc/` liefert kein Ergebnis).
- Selbst bei einem regulaeren `git push` durch `winAnt` gelangen die Dokumente aus `doc/` niemals auf GitHub und koennen von `piCon` im WSL-Klon niemals per `git pull` empfangen werden.
- Gleichzeitig existiert ein Ordner `docs/` (mit "s"), der getrackt wird, jedoch nicht der internen Regel fuer die Dateiablage entspricht.

### 2.4 Laufzeitdienste im Container
- **Vite Dev Server**: Laeuft im Container auf Port 5173 und ist auf den Windows-Host durchgeschleift.
- **LightRAG Backend**: Laeuft im Container auf Port 8000 via `.devcontainer/start-lightrag.sh` (Health-Status: `online`, Embedding: OpenRouter `qwen/qwen3-embedding-8b`).
- Das Frontend greift ueber den internen Vite-Proxy `/lightrag-api` auf das Backend zu.

---

## 3. Kritische Problemanalyse: Das Dilemma des geteilten Zugriffs

Wenn zwei unterschiedliche autonome Agenten (`winAnt` auf Windows, `piCon` auf Linux/Docker) gemeinsam auf dasselbe Repository zugreifen sollen, muessen grundlegende technische Konflikte beachtet werden:

### 3.1 I/O-Performance von WSL2 / Docker auf Windows-Dateisystemen
Wuerde `REPO_PATH` in `Nodges_Pi/.env` direkt auf das Windows-Verzeichnis `C:/Users/ich/Desktop/code/_projects/Nodges` umgebogen werden, greift der Linux-Container ueber das 9P/Plan9-Protokoll auf das Windows-NTFS-Dateisystem zu.
- Dies fuehrt erfahrungsgemaess zu einem dramatischen Einbruch der I/O-Performance (Faktor 5 bis 30 langsamer).
- Dateiintensive Vorgaenge wie `npm install`, TypeScript-Kompilierung (`tsc`) und der Start von Vite werden extrem verzoegert.
- `lightrag-backend` leidet unter verlangsamten Vektor- und Datenbankzugriffen.

### 3.2 Kollision von Build-Artefakten und nativen Modulen
- `node_modules`: Pakete mit nativen Binaries (z.B. esbuild fuer Vite, Rollup) werden bei `npm install` fuer die jeweilige Plattform kompiliert. Ein `npm install` auf Windows wuerde die Linux-Binaries im gemounteten Ordner ueberschreiben, wodurch Vite im Container abstuerzt.
- Python `venv`: Das virtuelle Environment fuer LightRAG (`lightrag-backend/venv`) enthaelt plattformabhaengige Skripte (`Scripts/` auf Windows vs. `bin/` auf Linux). Ein gemeinsamer Ordner fuehrt unweigerlich zu Inkompatibilitaeten.

### 3.3 Dateisystem-Events und Hot Module Reloading (Vite HMR)
Docker Desktop fuer Windows uebertraegt `inotify`-Dateisystemereignisse von NTFS-Host-Mounts oft unvollstaendig in den Container. Wenn `winAnt` auf Windows Code aendert, registriert Vite im Container die Aenderung moeglicherweise nicht automatisch, es sei denn, Vite wird mit `usePolling: true` betrieben (was wiederum erhoehte CPU-Last erzeugt).

### 3.4 Git-Index-Sperren (index.lock) und Concurrent Access
Wenn beide Agenten gleichzeitig auf denselben lokalen `.git`-Ordner zugreifen:
- Jeder Git-Schreibvorgang (`git add`, `git commit`, `git checkout`) erstellt eine Datei `.git/index.lock`.
- Greifen `winAnt` und `piCon` gleichzeitig zu, schlaegt der Befehl des zweiten Agenten mit einem Fehler fehl. Bricht ein Agent waehrend eines Schreibvorgangs ab, bleibt die Sperrdatei verwaist und blockiert alle weiteren Git-Aktionen.

### 3.5 Zeilenenden (CRLF vs. LF) und Dateirechte (core.fileMode)
- **Zeilenenden**: Windows nutzt standardmaessig `core.autocrlf=true` (CRLF im Arbeitsverzeichnis). Linux/Container nutzt LF. Ohne strikte `.gitattributes` erzeugen Textaenderungen auf einer Seite massive Phantom-Diffs auf der anderen Seite. Aktuell existiert im Repository **keine** `.gitattributes`-Datei.
- **Dateirechte**: Windows NTFS kennt keine POSIX-Berechtigungen. Auf Linux steht `core.filemode=true`, auf Windows `core.filemode=false`. Dies kann dazu fuehren, dass Git im Container Shell-Skripte oder Python-Dateien staendig als geaendert markiert.

---

## 4. Architektur-Optionen und Alternativen

Zur Erreichung des Ziels stehen vier grundlegende Architekturmodelle zur Auswahl:

### Alternative A: Echter Single-Mount auf Windows mit isolierten Docker-Volumes
Der Container mountet direkt `C:/Users/ich/Desktop/code/_projects/Nodges` als `/workspace`.
- **Massnahmen zur Absicherung**:
  - `node_modules` und `lightrag-backend/venv` duerfen **nicht** auf NTFS liegen, sondern muessen in Docker-Volumes ausgelagert werden (z.B. `- /workspace/node_modules` als anonymes Volume).
  - Anlegen einer `.gitattributes` mit `* text=auto eol=lf`.
  - Vite muss mit Polling konfiguriert werden (`server.watch.usePolling = true`).
  - Git-Konfiguration im Container: `core.fileMode = false` und `safe.directory = /workspace`.
- **Vorteile**: Sofortige Sichtbarkeit aller Codeaenderungen, Dokumente und Plaene ohne Git-Zwischenschritt.
- **Nachteile**: Spuerbare Performance-Einbussen bei I/O, erhoehte CPU-Last durch Polling, Risiko von `.git/index.lock`-Kollisionen bei gleichzeitigen Git-Aufrufen.

### Alternative B: Single Source of Truth in WSL2 (Host greift auf WSL zu)
Das primaere Arbeitsverzeichnis liegt in WSL2 (`/home/unixusername/nodges`).
- Der Container bind-mountet das native Linux-Verzeichnis (maximale Performance).
- Antigravity auf Windows greift ueber den Netzwerkpfad `//wsl.localhost/Ubuntu/home/unixusername/nodges` auf das Projekt zu.
- **Vorteile**: Exzellente Performance im Container fuer Vite und LightRAG, keine Binary-Kollisionen fuer Linux.
- **Nachteile**: Antigravity auf Windows arbeitet ueber einen UNC-Netzwerkpfad, was bei manchen Windows-Tools und Git-Operationen zu Latenzen fuehren kann.

### Alternative C: Dual-Clone mit versionierter Dokumentation und striktem Git-Sync (Aktuelle Basislinie optimiert)
Beide Klone (Windows und WSL2) bleiben physisch getrennt.
- **Notwendige Korrekturen**:
  1. `doc/` wird aus `.gitignore` entfernt und regulaer in Git getrackt.
  2. Vor jedem Arbeitsbeginn fuehrt der jeweilige Agent einen `git pull` aus.
  3. Nach Abschluss eines Arbeitsschritts wird committet und gepusht (z.B. via `sgc`-Skill).
- **Vorteile**: Hoechste Stabilitaet, maximale native Performance auf beiden Betriebssystemen, keine Sperr- oder Lock-Konflikte im Dateisystem, saubere Entkopplung von `node_modules` und Python-Umgebungen.
- **Nachteile**: Kein direkter Dateiaustausch in Echtzeit. Nicht committete Entwuerfe und temporaere Dateien des einen Agenten sind fuer den anderen unsichtbar.

### Alternative D: Hybrides Modell (Code getrennt / synchronisiert, doc/ als geteilter Mount)
Der Code verbleibt in zwei getrennten Klonen (oder in WSL), aber der Dokumentationsordner wird gezielt verknuepft:
- In `docker-compose.yml` wird zusaetzlich gemountet:
  `- C:/Users/ich/Desktop/code/_projects/Nodges/doc:/workspace/doc`
- **Vorteile**: Plaene, Analysen und Architektur-Dokumente sind fuer `winAnt` und `piCon` in Echtzeit ohne Git-Push verfuegbar. Gleichzeitig bleiben `node_modules`, Binaries und Git-Dateien voellig unberuehrt und isoliert.
- **Nachteile**: Nur Dokumente sind in Echtzeit synchron; Quellcode-Aenderungen benoetigen weiterhin Git-Synchronisation.

---

## 5. Konkrete Handlungsempfehlungen

Um einen reibungslosen, verlustfreien Multi-Harness-Betrieb zu garantieren, werden folgende Schritte empfohlen:

### Schritt 1: Dokumentations-Tracking aktivieren (Sofortmassnahme)
In `C:/Users/ich/Desktop/code/_projects/Nodges/.gitignore` muss der Eintrag `doc/` in Zeile 54 entfernt werden.
Plaene, Analysen und Protokolle gehoeren zur gemeinsamen Wissensbasis beider Agenten und muessen ueber Git synchronisiert werden koennen.

### Schritt 2: Zeilenenden harmonisieren
Eine Datei `.gitattributes` im Wurzelverzeichnis anlegen mit folgendem Inhalt:
```gitattributes
* text=auto eol=lf
*.cmd text eol=crlf
*.bat text eol=crlf
```
Damit wird sichergestellt, dass Linux-Skripte und Quellcode stets mit LF ausgecheckt werden, waehrend Windows-Batchdateien CRLF behalten.

### Schritt 3: Festlegung der Mount-Strategie
Fuer die Wahl zwischen Alternative A (Single-Mount) und Alternative C/D (Dual-Clone mit Doc-Sync):
- Wenn maximale Arbeitsgeschwindigkeit und Unabhaengigkeit gewuenscht sind: **Alternative C oder D**.
- Wenn absolut keine manuellen Git-Pushes fuer Zwischenschritte gewuenscht sind und der Performance-Verlust von Vite/LightRAG auf NTFS in Kauf genommen wird: **Alternative A** mit isolierten Volumes fuer `node_modules` und `venv`.

### Schritt 4: Uebergabe- und Kollaborationsprotokoll zwischen winAnt und piCon
1. **Kennzeichnung von Dokumenten**: Dokumente enthalten stets Angaben zum Autor (`winAnt` oder `piCon`) sowie einen eindeutigen Zeitstempel.
2. **Keine gleichzeitigen Schreibvorgaenge auf denselben Dateien**: Wenn ein Agent eine Komponente refaktoriert, kuendigt er dies im Uebergabedokument oder Commit an.
3. **Commit-Disziplin**: Vor der Uebergabe an den anderen Harness muessen Aenderungen vollstaendig gestaged und gepusht sein.

---

## 6. Uebergabebereich fuer piCon (Ergaenzungen aus dem Container)

Dieser Bereich ist fuer die Pruefung, Kritik und Ergaenzung durch den Agenten **piCon** im Container reserviert:

- [ ] Pruefung der I/O-Performance von LightRAG und Vite aus Sicht des Containers bei hypothetischem NTFS-Mount.
- [ ] Pruefung der Git-Credentials und Push-Faehigkeit von `piCon` ueber `/home/.pi/git-credentials`.
- [ ] Feedback zur Bevorzugung von Alternative A, C oder D.
- [ ] Rueckmeldung zum aktuellen Zustand von `/workspace/doc` im Container.

---

**Autor dieses Dokuments:** winAnt  
**Datum:** 2026-09-24  
**Projektversion:** 0.106.0  
