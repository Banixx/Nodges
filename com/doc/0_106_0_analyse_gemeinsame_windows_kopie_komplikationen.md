# Technische Analyse: Gemeinsame lokale Kopie auf Windows (Variante A)

## 1. Ueberblick

Bei Variante A dient der Windows-Ordner `C:/Users/ich/Desktop/code/_projects/Nodges` als alleinige lokale Quelle (Single Source of Truth). Der Docker-Container `pi-harness` mountet diesen Ordner direkt von Windows aus.

Da Docker Desktop unter Windows auf einer WSL2-Linux-VM laeuft, greift der Container ueber die interne 9P-Dateisystembruecke auf das Windows-NTFS-Dateisystem zu.

---

## 2. Die fuenf wesentlichen Komplikationen

### 2.1 I/O-Performance-Verlust (9P-Protokoll-Overhead)
- **Ursache**: Linux-Aufrufe (`read`, `write`, `stat`) muessen von der Linux-VM ueber einen virtuellen 9P-Dateisystemtreiber in Windows-NTFS-Befehle uebersetzt werden.
- **Auswirkung**: Bei einzelnen Quellcodedateien (TypeScript, Markdown) ist dies kaum spuerbar. Sobald jedoch viele Tausend Dateien gelesen werden (z.B. bei `npm install`, TypeScript-Kompilierung `tsc` oder Git-Statuspruefungen ueber den gesamten Baum), ist der Zugriff um den Faktor 5 bis 30 langsamer als auf einem nativen Linux-Dateisystem (ext4).

### 2.2 Kollision von nativen Modulen (`node_modules` und Python `venv`)
- **Ursache**: Manche npm-Pakete (z.B. esbuild fuer Vite, Rollup) sowie Python-Pakete fuer LightRAG kompilieren plattformspezifische C-Binaries:
  - Windows benoetigt Windows-PE-Binaries (`.exe`, `.dll`, `node_modules/@esbuild/win32-x64`).
  - Linux im Container benoetigt Linux-ELF-Binaries (`node_modules/@esbuild/linux-x64`).
  - Python auf Windows nutzt `venv/Scripts/python.exe`, Linux nutzt `venv/bin/python`.
- **Auswirkung**: Wuerden `node_modules` und `venv` auf der gemeinsamen Windows-Festplatte geteilt, wuerde jeder Paket-Befehl auf einer Seite die Umgebung der anderen Seite zerstoeren.
- **Loesung**: Die Ordner `node_modules` und `lightrag-backend/venv` muessen in `docker-compose.yml` zwingend ueber isolierte Docker-Volumes im Container gehalten werden und duerfen nicht auf Windows durchschlagen.

### 2.3 Dateisystem-Events und Hot-Module-Replacement (Vite HMR)
- **Ursache**: Das Linux-Subsystem `inotify` erhaelt Aenderungen, die ein Windows-Programm (Antigravity oder ein Editor) auf NTFS schreibt, ueber Docker Desktop haeufig verzoegert oder gar nicht.
- **Auswirkung**: Vite im Container aktualisiert den Browser bei Codeaenderungen moeglicherweise nicht automatisch.
- **Loesung**: In `vite.config.ts` muss Dateipolling aktiviert werden (`server.watch.usePolling = true`). Dadurch prueft Vite in festen Intervallen aktiv nach Aenderungen.

### 2.4 Gleichzeitiger Git-Zugriff und Index-Sperren (`.git/index.lock`)
- **Ursache**: Git schuetzt seinen Index bei Schreibvorgaengen (`git add`, `git commit`, `git checkout`) durch die Datei `.git/index.lock`.
- **Auswirkung**: Fuehren Antigravity und der Pi-Agent zufaellig zeitgleich einen Git-Befehl aus, schlaegt der zweite Befehl fehl. Bricht ein Prozess dabei ab, bleibt die Sperrdatei liegen und blockiert weitere Aktionen, bis sie manuell geloescht wird.

### 2.5 Dateirechte und Zeilenenden (CRLF vs. LF)
- **Ursache**: Windows nutzt standardmaessig CRLF und kennt keine POSIX-Ausfuehrungsbits (chmod +x). Linux nutzt LF.
- **Auswirkung**: Skripte wie `.devcontainer/start-lightrag.sh` koennen durch falsche Zeilenenden unbrauchbar werden. Git im Container koennte Dateien als geaendert markieren, nur weil sich die Berechtigungsmaske unterscheidet.
- **Loesung**:
  - Konfiguration in Git: `git config core.fileMode false`
  - Anlegen einer `.gitattributes`-Datei mit `* text=auto eol=lf`.

---

## 3. Rechenaufwand und Hardware-Ressourcen

| Bereich | Rechenaufwand / Belastung | Bewertung |
|---|---|---|
| **Schreiben / Lesen von Code** | Nahezu null zusaetzliche CPU-Last | Unkritisch |
| **Vite-Polling (HMR)** | Dauerhaft ca. 1 bis 3 % Hintergrund-CPU-Last auf dem Host | Leicht spuerbar, aber beherrschbar |
| **npm install / tsc** | Deutlich hoehere CPU- und Festplatten-I/O-Dauer als unter nativem Linux | Laengere Wartezeiten bei Paketupdates |
| **LightRAG Vektorspeicher** | Leicht verzoegerte Lese- und Schreibzeiten fuer lokale RAG-Dateien | Spuerbar bei grossen Dokumentenmengen |

---

## 4. Konkrete Voraussetzungen fuer eine stabile Umsetzung

Damit Variante A ohne Abstuerze funktioniert, sind folgende Einstellungen erforderlich:

1. **Volume-Isolation in `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml`**:
   ```yaml
   volumes:
     - ${REPO_PATH}:/workspace
     - /workspace/node_modules
     - /workspace/lightrag-backend/venv
   ```
2. **Polling in `C:/Users/ich/Desktop/code/_projects/Nodges/vite.config.ts`**:
   ```ts
   server: {
     watch: {
       usePolling: true,
       interval: 300,
     }
   }
   ```
3. **Zeilenenden-Definition**:
   Eine Datei `.gitattributes` im Root-Verzeichnis mit `* text=auto eol=lf`.
